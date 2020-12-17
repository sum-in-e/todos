import React, { useState } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import theme from '../styles/theme';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';
import EditTaskForm from './EditTaskForm';

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

const Task: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue, userInfo, taskList, setTaskList }) => {
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [remainingCount, setRemainingCount] = useState<number>(0);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const temporaryStorage: any = {};

	const onClickDelete = (): void => {
		if (userInfo.uid !== null) {
			const copyedTaskList = taskList.slice();
			const docIndex = copyedTaskList.findIndex(Sequence => Sequence.date === date);
			const data = copyedTaskList[docIndex].tasks;
			const dataLength = Object.keys(data).length;
			if (dataLength <= 1) {
				copyedTaskList.splice(docIndex, 1);
			} else {
				delete data[taskKey];
				const values = Object.values(data);
				values.forEach((value, index): void => {
					temporaryStorage[index] = value;
				});
				const taskObj = {
					date,
					tasks: temporaryStorage,
				};
				copyedTaskList.splice(docIndex, 1, taskObj);
			}
			setTaskList(copyedTaskList);
			dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
		}
	};

	const onClickEdit = () => {
		setIsEditing(true);
		setEditedDate(date);
		setRemainingCount(30 - taskValue.length);
	};

	const handleExitEditing = () => {
		setIsEditing(false);
	};

	const onClickCheckbox = (e: React.ChangeEvent<HTMLInputElement>): void => {
		if (userInfo.uid !== null) {
			console.log('onClickCheckbox 실행');
			if (e.target.labels !== null) {
				const {
					target: {
						labels: {
							0: { innerText: text },
						},
					},
				} = e;
				if (e.target.checked) {
					const copyedTaskList = taskList.slice();
					const docList = copyedTaskList.map(doc => doc.date);
					try {
						if (docList.includes('완료')) {
							const completedDocIndex = copyedTaskList.findIndex(Sequence => Sequence.date === '완료');
							const completedData = copyedTaskList[completedDocIndex].tasks;
							const completedDataLength = Object.keys(completedData).length;
							const taskObj = {
								date: '완료',
								tasks: {
									...completedData,
									[completedDataLength]: text,
								},
							};
							copyedTaskList.splice(completedDocIndex, 1, taskObj);
							dbService.doc(`${userInfo.uid}/완료`).update({ [completedDataLength]: text });
						} else {
							const taskObj = {
								date: '완료',
								tasks: {
									0: text,
								},
							};
							copyedTaskList.push(taskObj);
							dbService.collection(userInfo.uid).doc('완료').set({
								0: text,
							});
						}
						const docIndex = copyedTaskList.findIndex(Sequence => Sequence.date === date);
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
						dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
					} catch (err) {
						alert(err.message);
					} finally {
						setTaskList(copyedTaskList);
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
					userInfo={userInfo}
					isEditing={isEditing}
					editedDate={editedDate}
					setEditedDate={setEditedDate}
					handleExitEditing={handleExitEditing}
					isCompleted={false}
					remainingCount={remainingCount}
					taskList={taskList}
					setTaskList={setTaskList}
				/>
			) : (
				''
			)}
			<Container>
				<div>
					<Label>
						<CheckInput type="checkbox" onChange={onClickCheckbox} />
						<CheckSpan />
						{taskValue}
					</Label>
				</div>
				<div>
					<EditI onClick={onClickEdit} />
					<DeleteI onClick={onClickDelete} />
				</div>
			</Container>
		</>
	);
};

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.5rem;
`;

/* ********************* Hidden Wrapper Top ********************* */
const HiddenWrapper = styled.div<{ isSaving: boolean }>`
	display: ${props => (props.isSaving ? 'flex' : 'none')};
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 16;
	width: 10rem;
	height: 10rem;
	border-radius: 15px;
	background-color: rgba(17, 17, 17, 0.306);
	font-size: 0.7rem;
`;

/* ********************* 편집 비활성화 ********************* */
const Label = styled.label`
	position: relative;
	margin-right: 0.5rem;
	color: ${props => props.theme.light.whiteColor};
`;

const CheckInput = styled.input`
	margin-right: 0.8rem;
	opacity: 0;
`;

const CheckSpan = styled.span`
	position: absolute;
	top: 0px;
	left: 0px;
	height: 24px;
	width: 24px;
	background-color: transparent;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.light.whiteColor};

	&::after {
		position: absolute;
		content: '';
		left: 12px;
		top: 12px;
		height: 0px;
		width: 0px;
		border-radius: 5px;
		border: solid ${props => props.theme.light.greenColor};
		border-width: 0 3px 3px 0;
		-webkit-transform: rotate(0deg) scale(0);
		-ms-transform: rotate(0deg) scale(0);
		transform: rotate(0deg) scale(0);
		opacity: 1;
	}

	${Label} input:checked ~ & {
		background-color: ${props => props.theme.light.whiteColor};
		border-radius: 5px;
		-webkit-transform: rotate(0deg) scale(1);
		-ms-transform: rotate(0deg) scale(1);
		transform: rotate(0deg) scale(1);
		opacity: 1;
		border: 2px solid ${props => props.theme.light.whiteColor};
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
		border: solid ${props => props.theme.light.greenColor};
		border-width: 0 2px 2px 0;
		background-color: transparent;
		border-radius: 0;
	}
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

export default Task;
