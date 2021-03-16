import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { dbService } from '../../fbase';
import EditTaskForm from './EditTaskForm';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';
import { UserStateContext } from '../../components/App';

interface ITaskList {
	date: string;
	tasks: { (key: number): string };
}

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
	taskList: ITaskList[];
	setTaskList: React.Dispatch<React.SetStateAction<ITaskList[]>>;
}

const CompletedTask: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue, taskList, setTaskList }) => {
	const userInfo = useContext(UserStateContext);
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const temporaryStorage: any = {};

	const onClickEdit = () => {
		setIsEditing(true);
		setEditedDate('날짜미정');
	};

	const handleExitEditing = () => {
		setIsEditing(false);
	};

	const onClickDelete = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const warning = confirm('삭제하시겠습니까?');
			if (warning === true) {
				const copyedTaskList = JSON.parse(JSON.stringify(taskList));
				const docIndex = copyedTaskList.findIndex(
					(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
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
			} else {
				return;
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
	width: 75%;
	color: ${props => props.theme.light.textColor};
	text-decoration: line-through;
	word-wrap: break-word;
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
	color: ${props => props.theme.light.lineColor};
	cursor: pointer;
`;

const DeleteI = styled(DeleteBin)`
	width: 1rem;
	color: ${props => props.theme.light.lineColor};
	cursor: pointer;
`;

export default CompletedTask;
