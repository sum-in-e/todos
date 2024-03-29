import React, { useState, useRef, useEffect, useContext } from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
import { dbService } from '../../fbase';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/airbnb.css';
import { Clear } from 'styled-icons/material-outlined';
import { UserStateContext } from '../../components/App';
import { useTaskListState, useTaskListDispatch } from '../../context/TaskListContext';
import { deleteDoc, doc, setDoc, updateDoc } from '@firebase/firestore';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
	editedDate: string;
	setEditedDate: React.Dispatch<React.SetStateAction<string>>;
	isCompleted: boolean;
	handleExitEditing: () => void;
}

const EditTaskForm: React.FunctionComponent<IProps> = ({
	date,
	taskKey,
	taskValue,
	editedDate,
	setEditedDate,
	handleExitEditing,
	isCompleted,
}) => {
	const taskListState = useTaskListState();
	const taskListDispatch = useTaskListDispatch();
	const userInfo = useContext(UserStateContext);
	const [inputValue, setInputValue] = useState<string>(taskValue);
	const dateInputRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;

	const onClickClear = () => {
		setEditedDate('날짜미정');
	};

	const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
	};

	const onClickDelete = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			if (confirm('삭제하시겠습니까?') === true) {
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
					handleExitEditing();
				}
			}
		}
	};

	const onClickSave = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const copyedTaskList = JSON.parse(JSON.stringify(taskListState.taskList));
			const editedDateValue = dateInputRef.current.value == '' ? '날짜미정' : dateInputRef.current.value;
			try {
				if (date === editedDateValue) {
					const docIndex = copyedTaskList.findIndex(
						(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
					);
					const data = copyedTaskList[docIndex].tasks;
					data[taskKey] = inputValue;

					const docRef = doc(dbService, userInfo.uid, date);
					await updateDoc(docRef, { [taskKey]: inputValue });

					taskListDispatch({
						type: 'SET_TASKLIST',
						taskList: copyedTaskList,
					});
				} else {
					const temporaryStorage: any = {};
					const docList = copyedTaskList.map(
						(doc: { date: string; tasks: { (key: number): string } }) => doc.date,
					);
					if (docList.includes(editedDateValue)) {
						const docIndex = copyedTaskList.findIndex(
							(doc: { date: string; tasks: { (key: number): string } }) => doc.date === editedDateValue,
						);
						const data = copyedTaskList[docIndex].tasks;
						const dataLength = Object.keys(data).length;
						const taskObj = {
							date: editedDateValue,
							tasks: {
								...data,
								[dataLength]: inputValue,
							},
						};
						const completeRef = doc(dbService, userInfo.uid, editedDateValue);
						await updateDoc(completeRef, { [dataLength]: inputValue });

						copyedTaskList.splice(docIndex, 1, taskObj);
						const previousDocIndex = copyedTaskList.findIndex(
							(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
						);
						const previousData = copyedTaskList[previousDocIndex].tasks;
						delete previousData[taskKey];
						const values = Object.values(previousData);
						values.forEach((value, index): void => {
							temporaryStorage[index] = value;
						});
						const newTaskObj = {
							date,
							tasks: temporaryStorage,
						};
						if (Object.values(temporaryStorage).length === 0) {
							copyedTaskList.splice(previousDocIndex, 1);
						} else {
							copyedTaskList.splice(previousDocIndex, 1, newTaskObj);
						}
						try {
							await setDoc(doc(dbService, userInfo.uid, date), temporaryStorage);
							taskListDispatch({
								type: 'SET_TASKLIST',
								taskList: copyedTaskList,
							});
						} catch (err) {
							alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
							setDoc(doc(dbService, userInfo.uid, editedDateValue), data);
							handleExitEditing();
						}
					} else {
						const taskObj = {
							date: editedDateValue,
							tasks: {
								0: inputValue,
							},
						};
						await setDoc(doc(dbService, userInfo.uid, editedDateValue), {
							0: inputValue,
						});
						copyedTaskList.push(taskObj);
						copyedTaskList.sort(function (
							a: { date: string; tasks: { task: string } },
							b: { date: string; tasks: { task: string } },
						) {
							return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
						});
						const previousDocIndex = copyedTaskList.findIndex(
							(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
						);
						const previousData = copyedTaskList[previousDocIndex].tasks;
						delete previousData[taskKey];
						const values = Object.values(previousData);
						values.forEach((value, index): void => {
							temporaryStorage[index] = value;
						});
						const newTaskObj = {
							date,
							tasks: temporaryStorage,
						};
						if (Object.values(temporaryStorage).length === 0) {
							copyedTaskList.splice(previousDocIndex, 1);
						} else {
							copyedTaskList.splice(previousDocIndex, 1, newTaskObj);
						}
						try {
							await setDoc(doc(dbService, userInfo.uid, date), temporaryStorage);
							taskListDispatch({
								type: 'SET_TASKLIST',
								taskList: copyedTaskList,
							});
						} catch (err) {
							alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
							deleteDoc(doc(dbService, userInfo.uid, editedDateValue));
							handleExitEditing();
						}
					}
				}
			} catch (err) {
				alert('오류로 인해 저장에 실패하였습니다. 재시도 해주세요.');
				handleExitEditing();
			}
		}
	};

	useEffect(() => {
		flatpickr('#DatePickr', {
			disableMobile: true,
			onChange: function (selectedDates: any, dateStr: string, instance: any) {
				setEditedDate(dateStr === '' ? '날짜미정' : dateStr);
			},
		});
	}, []);

	return (
		<Container>
			<Background onClick={handleExitEditing} />
			<EditWrapper>
				<BtnWrapperTop>
					<ToggleBtn onClick={handleExitEditing}>취소</ToggleBtn>
					<SaveBtn onClick={onClickSave}>{isCompleted ? '복구' : '저장'}</SaveBtn>
				</BtnWrapperTop>
				<InputWrapper>
					<TaskInput
						type="text"
						maxLength={50}
						value={inputValue}
						onChange={onChangeInput}
						placeholder="Edit Task"
						required
					/>
					<DateWrapper>
						<DateTitle>Date</DateTitle>
						<DateInputWrapper>
							<DateInput
								id="DatePickr"
								type="text"
								placeholder="Select Date"
								ref={dateInputRef}
								value={editedDate === '날짜미정' ? '' : editedDate}
								data-input
								readOnly
							/>
							<ClearBtn onClick={onClickClear}>
								<ClearI />
							</ClearBtn>
						</DateInputWrapper>
					</DateWrapper>
					<SaveInput type="submit" />
				</InputWrapper>
				<BtnWrapperBottom>
					<DeleteBtn onClick={onClickDelete}>삭제</DeleteBtn>
				</BtnWrapperBottom>
			</EditWrapper>
		</Container>
	);
};

const Container = styled.div``;

/* ********************* Background ********************* */
const Background = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	z-index: 20;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.6);
 */
`;

/* ********************* Edit Task Wrapper ********************* */
const EditWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: fixed;
	top: 50%;
	left: 50%;
	z-index: 25;
	transform: translate(-50%, -50%);
	width: 90vw;
	height: 12rem;
	padding: 0.7rem 1rem;
	border: none;
	border-radius: 15px;
	background-color: ${props => props.theme.light.mainColor};
	${({ theme }) => theme.media.landscapeMobile`
		width : 50vw;
	`}
	${({ theme }) => theme.media.portraitTabletS`
		width : 60vw;
	`}
	${({ theme }) => theme.media.portraitTablet`		
		width : 50vw;
	`}
	${({ theme }) => theme.media.landscapeTablet`		
		width : 40vw;
	`}
	${({ theme }) => theme.media.desktop`		
		width : 30vw;
	`}
`;

/* ********************* Btn Wrapper Top ********************* */
const BtnWrapperTop = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	& > * {
		padding: 0;
		border: none;
		background-color: transparent;
		font-weight: 700;
		font-size: 0.7rem;
		color: ${props => props.theme.light.subColor};
		cursor: pointer;
		outline: none;
	}
`;

const SaveBtn = styled.button``;

const ToggleBtn = styled.button``;

/* ********************* Input Wrapper ********************* */
const InputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

const TaskInput = styled.input`
	height: 2rem;
	width: 100%;
	margin-bottom: 1rem;
	border: none;
	border-radius: 5px 5px 0 0;
	border-bottom: solid 2px ${props => props.theme.light.lineColor};
	background-color: ${props => props.theme.light.mainColor};
	color: ${props => props.theme.light.textColor};
	&:focus {
		outline: none;
		border-bottom: solid 2px ${props => props.theme.light.subColor};
	}
	&::placeholder {
		color: ${props => props.theme.light.lineColor};
	}
`;

const DateWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

const DateTitle = styled.span`
	font-size: 0.6rem;
	font-weight: 700;
	color: ${props => props.theme.light.lineColor};
`;

const DateInputWrapper = styled.div`
	display: flex;
	width: 100%;
`;

const DateInput = styled.input`
	width: 85%;
	height: 2rem;
	margin-top: 0.3rem;
	padding: 5px;
	border: solid 2px ${props => props.theme.light.lineColor};
	border-radius: 5px;
	background-color: ${props => props.theme.light.mainColor};
	color: ${props => props.theme.light.textColor};
	box-shadow: none;
	cursor: pointer;
	outline: none;
	&:focus {
		outline: none;
		border: solid 2px ${props => props.theme.light.subColor};
	}
	&::placeholder {
		color: ${props => props.theme.light.textColor};
	}
`;

const ClearBtn = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 15%;
	height: 2rem;
	margin-top: 0.3rem;
	border: solid 2px ${props => props.theme.light.lineColor};
	border-radius: 5px;
	background-color: transparent;
	cursor: pointer;
`;

const ClearI = styled(Clear)`
	width: 25px;
	color: ${props => props.theme.light.warnColor};
`;
const SaveInput = styled.input`
	display: none;
`;

/* ********************* Btn Wrapper Bottom ********************* */
const BtnWrapperBottom = styled.div`
	display: flex;
	justify-content: flex-end;
	width: 100%;
`;
const DeleteBtn = styled.button`
	padding: 0;
	border: none;
	background-color: transparent;
	font-weight: 700;
	font-size: 0.7rem;
	color: ${props => props.theme.light.warnColor};
	cursor: pointer;
	outline: none;
`;

export default React.memo(EditTaskForm);
