import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import theme from '../styles/theme';
import { defualtFirebase, dbService } from '../fbase';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	getTasks: () => void;
	toggleEdit: boolean;
	editedDate: string;
	setEditedDate: React.Dispatch<React.SetStateAction<string>>;
	onToggleClick: () => void;
	isCompleted: boolean;
}

const EditTaskForm: React.FunctionComponent<IProps> = ({
	date,
	taskKey,
	taskValue,
	userInfo,
	getTasks,
	toggleEdit,
	editedDate,
	setEditedDate,
	onToggleClick,
	isCompleted,
}) => {
	const [inputValue, setInputValue] = useState<string>(taskValue);
	const submitRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
	const saveRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const cancelRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const deleteRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const containerRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const temporaryStorage: any = {};

	if (toggleEdit) {
		console.log('편집중');
		setTimeout(function () {
			window.addEventListener('click', onOutsideClick);
		}, 100);
	}

	const onOutsideClick = (e: any): void => {
		const isInside = containerRef.current.contains(e.target as Node);
		if (isInside) {
			console.log('내부 클릭');
			if (e.target === cancelRef.current) {
				console.log('취소 클릭');
				window.removeEventListener('click', onOutsideClick);
				setTimeout(function () {
					onToggleClick();
				}, 100);
			}
			if (e.target === saveRef.current) {
				if (isCompleted) {
					console.log('복구 클릭');
				} else {
					console.log('저장 클릭');
				}
				submitRef.current.click();
				window.removeEventListener('click', onOutsideClick);
			}
			if (e.target === deleteRef.current) {
				console.log('삭제 클릭');
				window.removeEventListener('click', onOutsideClick);
				onDeleteClick();
			}
		} else {
			console.log('외부 클릭');
			onToggleClick();
			window.removeEventListener('click', onOutsideClick);
		}
	};

	const relocation = async (): Promise<void> => {
		const doc = dbService.doc(`${userInfo.uid}/${date}`);
		const data = (await doc.get()).data();
		if (data !== undefined) {
			const values = Object.values(data);
			values.forEach((value: string, index: number): void => {
				temporaryStorage[index] = value;
			});
			await doc.set(temporaryStorage);
			console.log('relocation 끝');
		}
	};

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
	};

	const onDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setEditedDate(value === '' ? '날짜미정' : value);
	};

	const onDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const doc = dbService.doc(`${userInfo.uid}/${date}`);
			const data = (await doc.get()).data();
			try {
				for (const key in data) {
					if (key === taskKey) {
						await doc.update({
							[key]: defualtFirebase.firestore.FieldValue.delete(),
						});
						await relocation();
					}
				}
			} catch (err) {
				alert(err.message);
			} finally {
				getTasks();
			}
		}
	};

	const onEditSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const theDoc = dbService.doc(`${userInfo.uid}/${date}`);
			const docData = (await theDoc.get()).data();
			if (date === editedDate) {
				try {
					for (const key in docData) {
						if (key === taskKey) {
							await theDoc.update({
								[key]: inputValue,
							});
						}
					}
				} catch (err) {
					alert(err.message);
				} finally {
					getTasks();
				}
			} else {
				const userCollection = await dbService.collection(userInfo.uid).get();
				const docList = userCollection.docs.map(doc => doc.id);
				if (docList.includes(editedDate)) {
					const doc = await dbService.doc(`${userInfo.uid}/${editedDate}`).get();
					const data = doc.data();
					if (data !== undefined) {
						const dataLength = Object.keys(data).length;
						const taskObj = {
							...data,
							[dataLength]: inputValue,
						};
						try {
							await doc.ref.update(taskObj);
							for (const key in docData) {
								if (key === taskKey) {
									await theDoc.update({
										[key]: defualtFirebase.firestore.FieldValue.delete(),
									});
									await relocation();
								}
							}
						} catch (err) {
							alert(err.message);
						} finally {
							getTasks();
						}
					}
				} else {
					try {
						dbService.collection(userInfo.uid).doc(editedDate).set({
							0: inputValue,
						});
						for (const key in docData) {
							if (key === taskKey) {
								await theDoc.update({
									[key]: defualtFirebase.firestore.FieldValue.delete(),
								});
								await relocation();
							}
						}
					} catch (err) {
						alert(err.message);
					} finally {
						getTasks();
					}
				}
			}
		}
	};

	return (
		<>
			<Background toggleEdit={toggleEdit} />
			<Container ref={containerRef}>
				<SubmitWrapperTop>
					<ToggleBtn ref={cancelRef}>취소</ToggleBtn>
					<SaveBtn ref={saveRef}>{isCompleted ? '복구' : '저장'}</SaveBtn>
				</SubmitWrapperTop>
				<Form onSubmit={onEditSave}>
					<EditTextInput
						type="text"
						value={inputValue}
						onChange={onInputChange}
						placeholder="Edit Task"
						required
					/>
					<DateTitle>Date</DateTitle>
					<DateInput
						type="date"
						value={editedDate === '날짜미정' ? '' : editedDate}
						onChange={onDateChange}
					/>
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
const Background = styled.div<{ toggleEdit: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	z-index: 20;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.6);
	opacity: ${props => (props.toggleEdit ? 1 : 0)};
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
	border: none;
	border-radius: 10px;
	background: none;
	font-size: 0.6rem;
	font-weight: 700;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	outline: none;
`;

/* ********************* Form Wrapper ********************* */
const Form = styled.form`
	display: flex;
	flex-direction: column;
`;

const EditTextInput = styled.input`
	height: 1.5rem;
	margin-bottom: 1rem;
	border: none;
	border-radius: 5px 5px 0 0;
	border-bottom: solid 2px ${props => props.theme.light.grayColor};
	background-color: ${props => props.theme.light.greenColor};
	font-size: 0.8rem;
	color: ${props => props.theme.light.whiteColor};

	&:focus {
		outline: none;
		background-color: #184039;
		border-bottom: solid 2px ${props => props.theme.light.yellowColor};
	}
	&::placeholder {
		color: ${props => props.theme.light.grayColor};
	}
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
