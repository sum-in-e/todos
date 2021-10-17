import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { dbService } from '../../fbase';
import theme from '../../styles/theme';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';
import EditTaskForm from './EditTaskForm';
import { UserStateContext } from '../../components/App';
import { useTaskListState, useTaskListDispatch } from '../../context/TaskListContext';
import useDeleteTodoMutation from '../../hooks/useDeleteTask';
import { updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ITodo } from '../../types/taskListTypes';
import { useMutation } from 'react-query';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: ITodo;
}

const Task: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue }) => {
	const taskListState = useTaskListState();
	const taskListDispatch = useTaskListDispatch();
	const userInfo = useContext(UserStateContext);
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [isEditing, setIsEditing] = useState<boolean>(false);

	console.log('taskList', taskListState);

	// const { mutate: deleteTodoMutate } = useMutation(deleteTaskApi, {
	// 	onSuccess: () => {},
	// 	onError: () => {},
	// });

	const onClickDelete = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			if (confirm('삭제하시겠습니까?')) {
				const temporaryStorage: any = {};

				// 기존 TaskList 가지고 있기 위해 복제 -> 대박 안 해도 된다.. Mutaion에 넘겨주면 롤백 기능 있어서 저장 안해도 되돌림
				const copyedTaskList = JSON.parse(JSON.stringify(taskListState.todoAll));
				// 복제한 TaskList에서 현재 date의 task obj의 index를 추출
				const docIndex = copyedTaskList.findIndex(
					(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
				);
				// 선택된 task가 속한 date의 task obj
				const data = copyedTaskList[docIndex].tasks;
				// 복제한 data에서 선택한 task를 제거 -> 이거를 여기서 하면 안되고 mutation 내에서 처리
				delete data[taskKey];
				// data의 값들만 추출
				const values = Object.values(data);
				// 제거되고 남은 task들을 temporaryStorage에 덮어씌움
				values.forEach((value, index): void => {
					temporaryStorage[index] = value;
				});
				// 새롭게 구성된 temporaryStorage를 가진 taskObj를 만듦
				const taskObj = {
					date,
					tasks: temporaryStorage,
				};
				// 삭제되고 남은 todo가 한개도 없으면 전체 리스트에서 해당 날짜의 doc 제거
				if (Object.values(temporaryStorage).length === 0) {
					copyedTaskList.splice(docIndex, 1);
				} else {
					// 삭제되고 todo가 하나라도 있으면 전체 todoAll에서 해당 날짜의 doc을 새로운 taskObj로 바꿔줌
					copyedTaskList.splice(docIndex, 1, taskObj);
				}
				try {
					// const deleteTodoMutation = useDeleteTodoMutation();
					// mutation에 todos 넘겨줄 때 filtering된 todos말고 기존 todos를 넘겨줘야 mutation 안에서 스냅샷 찍어서 롤백 가능
					// deleteTodoMutation.mutate({
					// 	uid: userInfo.uid,
					// 	date,
					// 	updatedTodos: temporaryStorage,
					// },{
					// 	onSuccess : {
					// 		alert('오류로 인해 삭제에 실패하였습니다. 재시도 해주세요.');

					// 	},
					// 	onError : {
					// 		alert('오류로 인해 삭제에 실패하였습니다. 재시도 해주세요.');

					// 	}
					// })
					// 서버에 새로운 taskList로 업데이트 성공하면 dispatch
					await setDoc(doc(dbService, userInfo.uid, date), temporaryStorage);

					// 전역 상태에 할일이 수정된 todoAll을 dispatch
					taskListDispatch({
						type: 'SET_TASKLIST',
						todoAll: copyedTaskList,
					});
				} catch (err) {
					// 서버에 새로운 taskList로 업데이트 실패 시, 기존 taskList는 그대로 있을테니 아무 변화 없음
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

	const handleTaskComplete = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		if (userInfo.uid !== null) {
			if (e.target.labels !== null) {
				if (e.target.checked) {
					const temporaryStorage: any = {};
					// 기존 TaskList 가지고 있기 위해 복제
					const copyedTaskList = JSON.parse(JSON.stringify(taskListState.todoAll));
					// 복제한 TaskList의 날짜만 있는 배열 생성
					const docList = copyedTaskList.map(
						(doc: { date: string; tasks: { (key: number): string } }) => doc.date,
					);
					try {
						// 날짜만 있는 배열에 완료가 있는 경우
						if (docList.includes('완료')) {
							// 완료 doc의 index 추출
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

							const completeRef = doc(dbService, userInfo.uid, '완료');

							await updateDoc(completeRef, { [completedDataLength]: taskValue });
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
								await setDoc(doc(dbService, userInfo.uid, date), temporaryStorage);
								taskListDispatch({
									type: 'SET_TASKLIST',
									todoAll: copyedTaskList,
								});
							} catch (err) {
								alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
								await setDoc(doc(dbService, userInfo.uid, '완료'), completedData);
							}
							// 날짜만 있는 배열에 완료가 없는 경우
						} else {
							const taskObj = {
								date: '완료',
								tasks: {
									0: taskValue,
								},
							};
							await setDoc(doc(dbService, userInfo.uid, '완료'), {
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
								await setDoc(doc(dbService, userInfo.uid, date), temporaryStorage);
								// 서버에 새로운 taskList로 업데이트 성공하면 dispatch
								taskListDispatch({
									type: 'SET_TASKLIST',
									todoAll: copyedTaskList,
								});
							} catch (err) {
								alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
								// 서버에 새로운 taskList 업데이트 실패하면, 서버에는 기본 taskList가 그대로 있을테니
								deleteDoc(doc(dbService, userInfo.uid, '완료'));
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
				/>
			) : (
				''
			)}
			<Container>
				<Label>
					<CheckInputHidden type="checkbox" onChange={handleTaskComplete} />
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

export default React.memo(Task);
