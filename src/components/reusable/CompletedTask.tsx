import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { dbService } from '../../fbase';
import EditTaskForm from './EditTaskForm';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';
import { UserStateContext } from '../../components/App';
import { useTaskListState, useTaskListDispatch } from '../../context/TaskListContext';
import { doc, setDoc } from '@firebase/firestore';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
}

const CompletedTask: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue }) => {
	const taskListState = useTaskListState();
	const taskListDispatch = useTaskListDispatch();
	const userInfo = useContext(UserStateContext);
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [isEditing, setIsEditing] = useState<boolean>(false);

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
				const temporaryStorage: any = {};
				const copyedTaskList = JSON.parse(JSON.stringify(taskListState.taskList));
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
					await setDoc(doc(dbService, userInfo.uid, date), temporaryStorage);
					taskListDispatch({
						type: 'SET_TASKLIST',
						taskList: copyedTaskList,
					});
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

export default React.memo(CompletedTask);
