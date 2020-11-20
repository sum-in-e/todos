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
		updateProfile: (args: object) => void;
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
			const theDoc = await dbService.doc(`${userInfo.uid}/${date}`);
			const docData = (await theDoc.get()).data();
			for (const key in docData) {
				if (docData[key] === task) {
					await theDoc.update({
						[key]: defualtFirebase.firestore.FieldValue.delete(),
					});
					getTasks();
				}
			}
		}
	};

	const onSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const theDoc = await dbService.doc(`${userInfo.uid}/${date}`);
			const docData = (await theDoc.get()).data();
			if (date === editedDate) {
				for (const key in docData) {
					if (docData[key] === task) {
						await theDoc.update({
							[key]: inputValue,
						});
						await getTasks();
					}
				}
				setToggleEdit(prev => !prev);
			} else if (date !== editedDate) {
				const userCollection = await dbService.collection(userInfo.uid).get();
				const docList = userCollection.docs.map(doc => doc.id);
				try {
					if (docList.includes(editedDate)) {
						userCollection.docs.forEach(
							async (result): Promise<void> => {
								if (result.id === editedDate) {
									const data = result.data();
									const taskObj = {
										...data,
										[uuidv4()]: inputValue,
									};
									await result.ref.update(taskObj);
								}
							},
						);
					} else {
						await dbService
							.collection(userInfo.uid)
							.doc(editedDate)
							.set({
								[uuidv4()]: inputValue,
							});
					}
				} catch (err) {
					console.log(err);
				} finally {
					for (const key in docData) {
						if (docData[key] === task) {
							await theDoc.update({
								[key]: defualtFirebase.firestore.FieldValue.delete(),
							});
							getTasks();
							setToggleEdit(false);
						}
					}
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

	const onCheckboxClick = async (e: any): Promise<void> => {
		if (userInfo.uid !== null) {
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
						userCollection.docs.forEach(
							async (result): Promise<void> => {
								if (result.id === '완료') {
									const data = result.data();
									const taskObj = {
										...data,
										[uuidv4()]: text,
									};
									await result.ref.update(taskObj);
								}
							},
						);
					} else {
						await dbService
							.collection(userInfo.uid)
							.doc('완료')
							.set({
								[uuidv4()]: text,
							});
					}
				}
			} catch (err) {
				console.log(err);
			} finally {
				const theDoc = await dbService.doc(`${userInfo.uid}/${date}`);
				const docData = (await theDoc.get()).data();
				for (const key in docData) {
					if (docData[key] === text) {
						await theDoc.update({
							[key]: defualtFirebase.firestore.FieldValue.delete(),
						});
						getTasks();
						e.target.checked = false;
					}
				}
			}
		}
	};

	return (
		<>
			{toggleEdit ? (
				<>
					<form onSubmit={onSave}>
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
				</>
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
