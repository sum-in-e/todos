import React, { useState } from 'react';
import styled from 'styled-components';
import { defualtFirebase, dbService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
	date: string;
	task: string;
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	getTasks: () => void;
}

const Task: React.FunctionComponent<IProps> = ({ date, task, userInfo, getTasks }) => {
	const [inputValue, setInputValue] = useState<string>(task);
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [toggleEdit, setToggleEdit] = useState<boolean>(false);

	const onDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setEditedDate(value === '' ? '날짜미정' : value);
	};

	const onDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			try {
				const theDoc = dbService.doc(`${userInfo.uid}/${date}`);
				const docData = (await theDoc.get()).data();
				for (const key in docData) {
					if (docData[key] === task) {
						await theDoc.update({
							[key]: defualtFirebase.firestore.FieldValue.delete(),
						});
					}
				}
			} catch (err) {
				alert(err);
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
						if (docData[key] === task) {
							await theDoc.update({
								[key]: inputValue,
							});
						}
					}
				} catch (err) {
					alert(err.message);
				} finally {
					getTasks();
					setToggleEdit(prev => !prev);
				}
			} else {
				const userCollection = await dbService.collection(userInfo.uid).get();
				const docList = userCollection.docs.map(doc => doc.id);
				try {
					if (docList.includes(editedDate)) {
						const doc = await dbService.doc(`${userInfo.uid}/${editedDate}`).get();
						const data = doc.data();
						const taskObj = {
							...data,
							[uuidv4()]: inputValue,
						};
						await doc.ref.update(taskObj);
					} else {
						await dbService
							.collection(userInfo.uid)
							.doc(editedDate)
							.set({
								[uuidv4()]: inputValue,
							});
					}
					for (const key in docData) {
						if (docData[key] === task) {
							await theDoc.update({
								[key]: defualtFirebase.firestore.FieldValue.delete(),
							});
						}
					}
				} catch (err) {
					alert(err.message);
				} finally {
					getTasks();
					setToggleEdit(false);
				}
			}
		}
	};

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
	};

	const onToggleClick = (): void => {
		setToggleEdit(prev => !prev);
		setEditedDate(date);
	};

	const onCheckboxClick = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		if (userInfo.uid !== null) {
			if (e.target.labels !== null) {
				const {
					target: {
						labels: {
							0: { innerText: text },
						},
					},
				} = e;
				try {
					if (e.target.checked) {
						const userCollection = await dbService.collection(userInfo.uid).get();
						const docList = userCollection.docs.map(doc => doc.id);
						if (docList.includes('완료')) {
							const completeDoc = await dbService.doc(`${userInfo.uid}/완료`).get();
							const data = completeDoc.data();
							const taskObj = {
								...data,
								[uuidv4()]: text,
							};
							await completeDoc.ref.update(taskObj);
						} else {
							await dbService
								.collection(userInfo.uid)
								.doc('완료')
								.set({
									[uuidv4()]: text,
								});
						}
						const theDoc = dbService.doc(`${userInfo.uid}/${date}`);
						const docData = (await theDoc.get()).data();
						for (const key in docData) {
							if (docData[key] === text) {
								await theDoc.update({
									[key]: defualtFirebase.firestore.FieldValue.delete(),
								});
							}
						}
					}
				} catch (err) {
					console.log(err);
				} finally {
					getTasks();
					e.target.checked = false;
				}
			}
		}
	};

	return (
		<>
			{toggleEdit ? (
				<Container>
					<form onSubmit={onEditSave}>
						<input
							type="text"
							value={inputValue}
							onChange={onInputChange}
							placeholder="Edit Task"
							required
						/>
						<input
							type="date"
							value={editedDate === '날짜미정' ? '' : editedDate}
							onChange={onDateChange}
						/>
						<button>저장</button>
						<button onClick={onToggleClick}>취소</button>
					</form>
				</Container>
			) : (
				<Container>
					<div>
						<label>
							<input type="checkbox" onChange={onCheckboxClick} />
							{task}
						</label>
					</div>
					<button onClick={onToggleClick}>수정</button>
					<button onClick={onDeleteClick}>삭제</button>
				</Container>
			)}
		</>
	);
};

const Container = styled.div``;

export default Task;
