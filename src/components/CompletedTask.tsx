import React, { useState } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import EditTaskForm from './EditTaskForm';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	taskList: any[];
	setTaskList: React.Dispatch<React.SetStateAction<any[]>>;
}

const CompletedTask: React.FunctionComponent<IProps> = ({
	date,
	taskKey,
	taskValue,
	userInfo,
	taskList,
	setTaskList,
}) => {
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [remainingCount, setRemainingCount] = useState<number>(0);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const temporaryStorage: any = {};

	console.log('CompletedTask.tsx 실행');

	const onClickEdit = () => {
		setIsEditing(true);
		setEditedDate('날짜미정');
		setRemainingCount(30 - taskValue.length);
	};

	const handleExitEditing = () => {
		setIsEditing(false);
	};

	const onClickDelete = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const copyedTaskList = JSON.parse(JSON.stringify(taskList));
			const docIndex = copyedTaskList.findIndex(
				(Sequence: { date: string; tasks: { task: string } }) => Sequence.date === date,
			);
			const data = copyedTaskList[docIndex].tasks;
			delete data[taskKey];
			const values = Object.values(data);
			values.forEach((value, index): void => {
				temporaryStorage[index] = value;
			});
			const taskObj = {
				date,
				tasks: temporaryStorage,
			};
			if (Object.values(temporaryStorage).length === 0) {
				copyedTaskList.splice(docIndex, 1);
			} else {
				copyedTaskList.splice(docIndex, 1, taskObj);
			}
			try {
				await dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
				setTaskList(copyedTaskList);
			} catch (err) {
				alert('오류로 인해 삭제에 실패하였습니다. 재시도 해주세요.');
			}
		}
	};

	return (
		<>
			{isEditing ? (
				<EditTaskForm
					date={date}
					taskKey={taskKey}
					taskValue={taskValue}
					userInfo={userInfo}
					isEditing={isEditing}
					editedDate={editedDate}
					setEditedDate={setEditedDate}
					handleExitEditing={handleExitEditing}
					isCompleted={true}
					remainingCount={remainingCount}
					taskList={taskList}
					setTaskList={setTaskList}
				/>
			) : (
				''
			)}
			<Container>
				<Task>{taskValue}</Task>
				<BtnWrapper>
					<EditI onClick={onClickEdit} />
					<DeleteI onClick={onClickDelete} />
				</BtnWrapper>
			</Container>
		</>
	);
};

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.5rem;
`;
const Task = styled.span`
	color: ${props => props.theme.light.whiteColor};
	text-decoration: line-through;
`;

const BtnWrapper = styled.div``;

const EditI = styled(EditAlt)`
	width: 1rem;
	margin-right: 0.2rem;
	color: ${props => props.theme.light.grayColor};
`;

const DeleteI = styled(DeleteBin)`
	width: 1rem;
	color: ${props => props.theme.light.grayColor};
`;

export default React.memo(CompletedTask);
