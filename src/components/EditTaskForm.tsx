import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import theme from '../styles/theme';
import { dbService } from '../fbase';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	isEditing: boolean;
	editedDate: string;
	setEditedDate: React.Dispatch<React.SetStateAction<string>>;
	handleExitEditing: () => void;
	isCompleted: boolean;
	remainingCount: number;
	taskList: any[];
	setTaskList: React.Dispatch<React.SetStateAction<any[]>>;
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
	remainingCount,
	taskList,
	setTaskList,
}) => {
	const [inputValue, setInputValue] = useState<string>(taskValue);
	const [count, setCount] = useState<number>(remainingCount);
	const submitRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
	const saveRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const cancelRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const deleteRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const containerRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const temporaryStorage: any = {};

	const handleOutsideClick = (e: any): void => {
		const isInside = containerRef.current.contains(e.target as Node);
		if (isInside) {
			if (e.target === cancelRef.current) {
				window.removeEventListener('click', handleOutsideClick);
				setTimeout(function () {
					handleExitEditing();
				}, 100);
			}
			if (e.target === saveRef.current) {
				window.removeEventListener('click', handleOutsideClick);
				submitRef.current.click();
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
		const length = value.length;
		if (length <= 30) {
			setInputValue(value);
			setCount(30 - length);
		}
	};

	const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setEditedDate(value === '' ? '날짜미정' : value);
	};

	const handleDeleteClick = (): void => {
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
			setTimeout(function () {
				setTaskList(copyedTaskList);
			}, 100);
			dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
		}
	};

	const onSubmitEdit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const copyedTaskList = taskList.slice();
			try {
				if (date === editedDate) {
					const docIndex = copyedTaskList.findIndex(Sequence => Sequence.date === date);
					const data = copyedTaskList[docIndex].tasks;
					data[taskKey] = inputValue;
					dbService.doc(`${userInfo.uid}/${date}`).set(data);
				} else {
					const docList = copyedTaskList.map(doc => doc.date);
					if (docList.includes(editedDate)) {
						const docIndex = copyedTaskList.findIndex(Sequence => Sequence.date === editedDate);
						const data = copyedTaskList[docIndex].tasks;
						const dataLength = Object.keys(data).length;
						const taskObj = {
							date: editedDate,
							tasks: {
								...data,
								[dataLength]: inputValue,
							},
						};
						copyedTaskList.splice(docIndex, 1, taskObj);
						dbService.doc(`${userInfo.uid}/${editedDate}`).update({ [dataLength]: inputValue });
					} else {
						const taskObj = {
							date: editedDate,
							tasks: {
								0: inputValue,
							},
						};
						copyedTaskList.push(taskObj);
						copyedTaskList.sort(function (a, b) {
							return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
						});
						dbService.collection(userInfo.uid).doc(editedDate).set({
							0: inputValue,
						});
					}
					const previousDocIndex = copyedTaskList.findIndex(Sequence => Sequence.date === date);
					const data = copyedTaskList[previousDocIndex].tasks;
					const dataLength = Object.keys(data).length;
					if (dataLength <= 1) {
						copyedTaskList.splice(previousDocIndex, 1);
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
						copyedTaskList.splice(previousDocIndex, 1, taskObj);
					}
					dbService.doc(`${userInfo.uid}/${date}`).set(temporaryStorage);
				}
			} catch (err) {
				alert(err.message);
			} finally {
				setTimeout(function () {
					setTaskList(copyedTaskList);
				}, 100);
			}
		}
	};
	return (
		<>
			<Background isEditing={isEditing} />
			<Container ref={containerRef}>
				<SubmitWrapperTop>
					<ToggleBtn ref={cancelRef}>취소</ToggleBtn>
					<SaveBtn ref={saveRef}>{isCompleted ? '복구' : '저장'}</SaveBtn>
				</SubmitWrapperTop>
				<Form onSubmit={onSubmitEdit}>
					<TextWrapper>
						<EditTextInput
							type="text"
							value={inputValue}
							onChange={onChangeInput}
							placeholder="Edit Task"
							required
						/>
						<Counter isLimited={count === 0}>{count}</Counter>
					</TextWrapper>
					<DateWrapper>
						<DateTitle>Date</DateTitle>
						<DateInput
							type="date"
							value={editedDate === '날짜미정' ? '' : editedDate}
							onChange={onChangeDate}
						/>
					</DateWrapper>
					<SaveInput type="submit" ref={submitRef} />
				</Form>
				<SubmitWrapperBottom>
					<DeleteBtn ref={deleteRef}>삭제</DeleteBtn>
				</SubmitWrapperBottom>
			</Container>
		</>
	);
};

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

/* ********************* Container ********************* */
const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 25;
	width: 10rem;
	height: 10rem;
	padding: 0.7rem 1rem;
	border: none;
	border-radius: 15px;
	background-color: ${props => props.theme.light.greenColor};
	box-shadow: 0px 0px 5px 0px rgba(255, 255, 255, 0.84);
`;

/* ********************* Submit Wrapper Top ********************* */
const SubmitWrapperTop = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
`;

const SaveBtn = styled.button`
	padding: 0;
	border: none;
	border-radius: 10px;
	background: none;
	font-size: 0.6rem;
	font-weight: 700;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	outline: none;
`;

const ToggleBtn = styled.button`
	padding: 0;
	border: none;
	border-radius: 10px;
	background: none;
	font-size: 0.6rem;
	font-weight: 700;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	outline: none;
`;

/* ********************* Form ********************* */
const Form = styled.form`
	display: flex;
	flex-direction: column;
`;

const TextWrapper = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
`;

const EditTextInput = styled.input`
	height: 1.5rem;
	width: 85%;
	border: none;
	border-radius: 5px 5px 0 0;
	border-bottom: solid 2px ${props => props.theme.light.grayColor};
	background-color: ${props => props.theme.light.greenColor};
	font-size: 0.8rem;
	color: ${props => props.theme.light.whiteColor};

	&:focus {
		outline: none;
		border-bottom: solid 2px ${props => props.theme.light.yellowColor};
	}
	&::placeholder {
		color: ${props => props.theme.light.grayColor};
	}
`;

const Counter = styled.div<{ isLimited: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 1.5rem;
	width: 15%;
	margin-left: 0.3rem;
	padding: 0 0.3rem;
	border-bottom: 2px solid ${props => (props.isLimited ? props.theme.light.yellowColor : props.theme.light.grayColor)};
	font-size: 0.7rem;
	color: ${props => (props.isLimited ? props.theme.light.yellowColor : props.theme.light.whiteColor)};
`;

const DateWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

const DateTitle = styled.span`
	font-size: 0.5rem;
	font-weight: 700;
	color: ${props => props.theme.light.grayColor};
`;

const DateInput = styled.input`
	height: 1.5rem;
	width: 100%;
	padding: 5px;
	margin-top: 0.3rem;
	border: solid 2px ${props => props.theme.light.grayColor};
	border-radius: 5px;
	font-size: 0.7rem;
	background-color: ${props => props.theme.light.greenColor};

	color: ${props => props.theme.light.whiteColor};

	&:focus {
		outline: none;
		border: solid 2px ${props => props.theme.light.yellowColor};
	}
`;

const SaveInput = styled.input`
	display: none;
`;

/* ********************* Submit Wrapper Bottom ********************* */
const SubmitWrapperBottom = styled.div`
	display: flex;
	justify-content: flex-end;
	width: 100%;
`;
const DeleteBtn = styled.button`
	padding: 0;
	border: none;
	border-radius: 10px;
	background: none;
	font-size: 0.6rem;
	font-weight: 700;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	outline: none;
`;

export default EditTaskForm;
