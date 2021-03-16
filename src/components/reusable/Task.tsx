import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { dbService } from '../../fbase';
import theme from '../../styles/theme';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';
import EditTaskForm from './EditTaskForm';
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

const Task: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue, taskList, setTaskList }) => {
	const userInfo = useContext(UserStateContext);
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const temporaryStorage: any = {};

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

	const onClickEdit = () => {
		setIsEditing(true);
		setEditedDate(date);
	};

	const handleExitEditing = () => {
		setIsEditing(false);
	};

	const onClickCheckbox = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		if (userInfo.uid !== null) {
			if (e.target.labels !== null) {
				if (e.target.checked) {
					const copyedTaskList = JSON.parse(JSON.stringify(taskList));
					const docList = copyedTaskList.map(
						(doc: { date: string; tasks: { (key: number): string } }) => doc.date,
					);
					try {
						if (docList.includes('완료')) {
							const completedDocIndex = copyedTaskList.findIndex(
								(doc: { date: string; tasks: { (key: number): string } }) => doc.date === '완료',
							);
							const completedData = copyedTaskList[completedDocIndex].tasks;
							const completedDataLength = Object.keys(completedData).length;
							const taskObj = {
								date: '완료',
								tasks: {
									...completedData,
									[completedDataLength]: taskValue,
								},
							};
							await dbService.doc(`${userInfo.uid}/완료`).update({ [completedDataLength]: taskValue });
							copyedTaskList.splice(completedDocIndex, 1, taskObj);
							const docIndex = copyedTaskList.findIndex(
								(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
							);
							const data = copyedTaskList[docIndex].tasks;
							delete data[taskKey];
							const values = Object.values(data);
							values.forEach((value, index): void => {
								temporaryStorage[index] = value;
							});
							const newTaskObj = {
								date,
								tasks: temporaryStorage,
							};
							if (Object.values(temporaryStorage).length === 0) {
								copyedTaskList.splice(docIndex, 1);
							} else {
								copyedTaskList.splice(docIndex, 1, newTaskObj);
							}
							try {
								await dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
								setTaskList(copyedTaskList);
							} catch (err) {
								alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
								dbService.doc(`${userInfo.uid}/완료`).set(completedData);
							}
						} else {
							const taskObj = {
								date: '완료',
								tasks: {
									0: taskValue,
								},
							};
							await dbService.collection(userInfo.uid).doc('완료').set({
								0: taskValue,
							});
							copyedTaskList.push(taskObj);
							const docIndex = copyedTaskList.findIndex(
								(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
							);
							const data = copyedTaskList[docIndex].tasks;
							delete data[taskKey];
							const values = Object.values(data);
							values.forEach((value, index): void => {
								temporaryStorage[index] = value;
							});
							const newTaskObj = {
								date,
								tasks: temporaryStorage,
							};
							if (Object.values(temporaryStorage).length === 0) {
								copyedTaskList.splice(docIndex, 1);
							} else {
								copyedTaskList.splice(docIndex, 1, newTaskObj);
							}
							try {
								await dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
								setTaskList(copyedTaskList);
							} catch (err) {
								alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
								dbService.doc(`${userInfo.uid}/완료`).delete();
							}
						}
					} catch (err) {
						alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
					} finally {
						e.target.checked = false;
					}
				}
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
					isCompleted={false}
					taskList={taskList}
					setTaskList={setTaskList}
				/>
			) : (
				''
			)}
			<Container>
				<Label>
					<CheckInputHidden type="checkbox" onChange={onClickCheckbox} />
					<CheckSpanShowing />
					<OutputTask>{taskValue}</OutputTask>
				</Label>
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
	margin-bottom: 0.7rem;
`;

/* ********************* Label ********************* */
const Label = styled.label`
	position: relative;
	display: flex;
	align-items: center;
	width: 80%;
	padding-right: 0.3rem;
	color: ${props => props.theme.light.textColor};
`;

const CheckInputHidden = styled.input`
	margin-right: 0.8rem;
	opacity: 0;
`;

const CheckSpanShowing = styled.span`
	position: absolute;
	top: 0px;
	left: 0px;
	height: 24px;
	width: 24px;
	background-color: transparent;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.light.textColor};
	cursor: pointer;
	&::after {
		position: absolute;
		content: '';
		left: 12px;
		top: 12px;
		height: 0px;
		width: 0px;
		border-radius: 5px;
		border: solid ${props => props.theme.light.mainColor};
		border-width: 0 3px 3px 0;
		-webkit-transform: rotate(0deg) scale(0);
		-ms-transform: rotate(0deg) scale(0);
		transform: rotate(0deg) scale(0);
		opacity: 1;
	}

	${Label} input:checked ~ & {
		background-color: ${props => props.theme.light.textColor};
		border-radius: 5px;
		-webkit-transform: rotate(0deg) scale(1);
		-ms-transform: rotate(0deg) scale(1);
		transform: rotate(0deg) scale(1);
		opacity: 1;
		border: 2px solid ${props => props.theme.light.textColor};
	}

	${Label} input:checked ~ &::after {
		-webkit-transform: rotate(45deg) scale(1);
		-ms-transform: rotate(45deg) scale(1);
		transform: rotate(45deg) scale(1);
		opacity: 1;
		left: 6px;
		top: 1px;
		width: 6px;
		height: 12px;
		border: solid ${props => props.theme.light.mainColor};
		border-width: 0 2px 2px 0;
		background-color: transparent;
		border-radius: 0;
	}
`;

const OutputTask = styled.span`
	width: 80%;
	word-wrap: break-word;
	${({ theme }) => theme.media.landscapeMobile`
		width : 90%;
	`}
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

export default Task;
