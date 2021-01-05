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
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const temporaryStorage: any = {};

	console.log('CompletedTask.tsx 실행');

	const onClickEdit = () => {
		setIsEditing(true);
		setEditedDate('날짜미정');
	};

	const handleExitEditing = () => {
		setIsEditing(false);
	};

	const onClickDelete = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const copyedTaskList = JSON.parse(JSON.stringify(taskList));
			const docIndex = copyedTaskList.findIndex(
				(doc: { date: string; tasks: { task: string } }) => doc.date === date,
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
					taskList={taskList}
					setTaskList={setTaskList}
				/>
			) : (
				''
			)}
			<Container>
				<OutputTask>{taskValue}</OutputTask>
				<IconWrapper>
					<EditI onClick={onClickEdit} />
					<DeleteI onClick={onClickDelete} />
				</IconWrapper>
			</Container>
		</>
	);
};

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
`;

/* ********************* Output Task ********************* */
const OutputTask = styled.span`
	width: 85%;
	color: ${props => props.theme.light.whiteColor};
	text-decoration: line-through;
`;

/* ********************* Icon Wrapper ********************* */
const IconWrapper = styled.div`
	display: flex;
	align-items: center;
	width: auto;
`;

const EditI = styled(EditAlt)`
	width: 1rem;
	margin-right: 0.2rem;
	color: ${props => props.theme.light.grayColor};
`;

const DeleteI = styled(DeleteBin)`
	width: 1rem;
	color: ${props => props.theme.light.grayColor};
`;

export default CompletedTask;
