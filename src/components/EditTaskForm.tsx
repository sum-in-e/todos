import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import theme from '../styles/theme';
import { dbService } from '../fbase';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/airbnb.css';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	taskList: any[];
	setTaskList: React.Dispatch<React.SetStateAction<any[]>>;
	date: string;
	taskKey: string;
	taskValue: string;
	editedDate: string;
	setEditedDate: React.Dispatch<React.SetStateAction<string>>;
	isEditing: boolean;
	isCompleted: boolean;
	handleExitEditing: () => void;
}

const EditTaskForm: React.FunctionComponent<IProps> = ({
	date,
	taskKey,
	taskValue,
	userInfo,
	isEditing,
	editedDate,
	setEditedDate,
	handleExitEditing,
	isCompleted,
	taskList,
	setTaskList,
}) => {
	const [inputValue, setInputValue] = useState<string>(taskValue);
	const textInputRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
	const dateInputRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
	const submitRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
	const saveRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const cancelRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const deleteRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const EditWrapperRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const temporaryStorage: any = {};

	const handleOutsideClick = (e: any): void => {
		const isInside = EditWrapperRef.current.contains(e.target as Node);
		if (isInside) {
			if (e.target === cancelRef.current) {
				window.removeEventListener('click', handleOutsideClick);
				setTimeout(function () {
					handleExitEditing();
				}, 100);
			}
			if (e.target === saveRef.current) {
				window.removeEventListener('click', handleOutsideClick);
				handleSubmitClick();
			}
			if (e.target === deleteRef.current) {
				window.removeEventListener('click', handleOutsideClick);
				handleDeleteClick();
			}
		} else {
			window.removeEventListener('click', handleOutsideClick);
			setTimeout(function () {
				handleExitEditing();
			}, 100);
		}
	};

	if (isEditing) {
		setTimeout(function () {
			window.addEventListener('click', handleOutsideClick);
		}, 100);
	} else {
		window.removeEventListener('click', handleOutsideClick);
	}

	const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
	};

	const handleDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const warning = confirm('삭제하시겠습니까?');
			if (warning === true) {
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
					handleExitEditing();
				}
			} else {
				window.addEventListener('click', handleOutsideClick);
				return;
			}
		}
	};

	const handleSubmitClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const copyedTaskList = JSON.parse(JSON.stringify(taskList));
			const textInputValue = textInputRef.current.value;
			const editedDateValue = dateInputRef.current.value == '' ? '날짜미정' : dateInputRef.current.value;
			try {
				if (date === editedDateValue) {
					const docIndex = copyedTaskList.findIndex(
						(doc: { date: string; tasks: { task: string } }) => doc.date === date,
					);
					const data = copyedTaskList[docIndex].tasks;
					data[taskKey] = textInputValue;
					await dbService.doc(`${userInfo.uid}/${date}`).update({ [taskKey]: textInputValue });
					setTaskList(copyedTaskList);
				} else {
					const docList = copyedTaskList.map((doc: { date: string; tasks: { task: string } }) => doc.date);
					if (docList.includes(editedDateValue)) {
						const docIndex = copyedTaskList.findIndex(
							(doc: { date: string; tasks: { task: string } }) => doc.date === editedDateValue,
						);
						const data = copyedTaskList[docIndex].tasks;
						const dataLength = Object.keys(data).length;
						const taskObj = {
							date: editedDateValue,
							tasks: {
								...data,
								[dataLength]: textInputValue,
							},
						};

						await dbService
							.doc(`${userInfo.uid}/${editedDateValue}`)
							.update({ [dataLength]: textInputValue });
						copyedTaskList.splice(docIndex, 1, taskObj);
						const previousDocIndex = copyedTaskList.findIndex(
							(doc: { date: string; tasks: { task: string } }) => doc.date === date,
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
							await dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
							setTaskList(copyedTaskList);
						} catch (err) {
							alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
							dbService.doc(`${userInfo.uid}/${editedDateValue}`).set(data);
							handleExitEditing();
						}
					} else {
						const taskObj = {
							date: editedDateValue,
							tasks: {
								0: textInputValue,
							},
						};

						await dbService.collection(userInfo.uid).doc(editedDateValue).set({
							0: textInputValue,
						});
						copyedTaskList.push(taskObj);
						copyedTaskList.sort(function (
							a: { date: string; tasks: { task: string } },
							b: { date: string; tasks: { task: string } },
						) {
							return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
						});
						const previousDocIndex = copyedTaskList.findIndex(
							(doc: { date: string; tasks: { task: string } }) => doc.date === date,
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
							await dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
							setTaskList(copyedTaskList);
						} catch (err) {
							alert('오류로 인해 작업에 실패하였습니다. 재시도 해주세요.');
							dbService.doc(`${userInfo.uid}/${editedDateValue}`).delete();
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
			onChange: function (selectedDates: any, dateStr: any, instance: any) {
				setEditedDate(dateStr === '' ? '날짜미정' : dateStr);
			},
		});
	}, []);

	return (
		<Container>
			<Background isEditing={isEditing} />
			<EditWrapper ref={EditWrapperRef}>
				<BtnWrapperTop>
					<ToggleBtn ref={cancelRef}>취소</ToggleBtn>
					<SaveBtn ref={saveRef}>{isCompleted ? '복구' : '저장'}</SaveBtn>
				</BtnWrapperTop>
				<InputWrapper>
					<TaskInput
						ref={textInputRef}
						type="text"
						maxLength={50}
						value={inputValue}
						onChange={onChangeInput}
						placeholder="Edit Task"
						required
					/>
					<DateWrapper>
						<DateTitle>Date</DateTitle>
						<DateInput
							id="DatePickr"
							placeholder="Date"
							value={editedDate === '날짜미정' ? '' : editedDate}
							ref={dateInputRef}
							readOnly
						/>
					</DateWrapper>
					<SaveInput type="submit" ref={submitRef} />
				</InputWrapper>
				<BtnWrapperBottom>
					<DeleteBtn ref={deleteRef}>삭제</DeleteBtn>
				</BtnWrapperBottom>
			</EditWrapper>
		</Container>
	);
};

const Container = styled.div``;

/* ********************* Background ********************* */
const Background = styled.div<{ isEditing: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	z-index: 20;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.6);
	opacity: ${props => (props.isEditing ? 1 : 0)};
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
	background-color: ${props => props.theme.light.greenColor};
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
		color: ${props => props.theme.light.yellowColor};
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
	border-bottom: solid 2px ${props => props.theme.light.grayColor};
	background-color: ${props => props.theme.light.greenColor};
	color: ${props => props.theme.light.whiteColor};
	&:focus {
		outline: none;
		border-bottom: solid 2px ${props => props.theme.light.yellowColor};
	}
	&::placeholder {
		color: ${props => props.theme.light.grayColor};
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
	color: ${props => props.theme.light.grayColor};
`;

const DateInput = styled.input`
	width: 100%;
	height: 2rem;
	margin-top: 0.3rem;
	padding: 5px;
	border: solid 2px ${props => props.theme.light.grayColor};
	border-radius: 5px;
	background-color: transparent;
	color: ${props => props.theme.light.whiteColor};
	cursor: pointer;
	outline: none;
	&:focus {
		outline: none;
		border: solid 2px ${props => props.theme.light.yellowColor};
	}
	&::placeholder {
		color: ${props => props.theme.light.whiteColor};
	}
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
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	outline: none;
`;

export default EditTaskForm;
