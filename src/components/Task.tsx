import React, { useState } from 'react';
import styled from 'styled-components';
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
}

const Task: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue, userInfo, getTasks }) => {
	const [inputValue, setInputValue] = useState<string>(taskValue);
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [toggleEdit, setToggleEdit] = useState<boolean>(false);
	const temporaryStorage: any = {};

	const relocation = async (): Promise<void> => {
		const doc = dbService.doc(`${userInfo.uid}/${date}`);
		const data = (await doc.get()).data();
		if (data !== undefined) {
			const values = Object.values(data);
			values.forEach((value, index): void => {
				temporaryStorage[index] = value;
			});
			await doc.set(temporaryStorage);
			console.log('relocation 끝');
		}
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
			for (const key in data) {
				if (key === taskKey) {
					await doc.update({
						[key]: defualtFirebase.firestore.FieldValue.delete(),
					});
				}
			}
			await relocation();
			getTasks();
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
				if (e.target.checked) {
					const userCollection = await dbService.collection(userInfo.uid).get();
					const docList = userCollection.docs.map(doc => doc.id);
					if (docList.includes('완료')) {
						const completeDoc = await dbService.doc(`${userInfo.uid}/완료`).get();
						const data = completeDoc.data();
						if (data !== undefined) {
							const dataLength = Object.keys(data).length;
							const taskObj = {
								...data,
								[dataLength]: text,
							};
							try {
								await completeDoc.ref.update(taskObj);
								const doc = dbService.doc(`${userInfo.uid}/${date}`);
								const data = (await doc.get()).data();
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
								e.target.checked = false;
								getTasks();
							}
						}
					} else {
						try {
							await dbService.collection(userInfo.uid).doc('완료').set({
								0: text,
							});
							const doc = dbService.doc(`${userInfo.uid}/${date}`);
							const data = (await doc.get()).data();
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
							e.target.checked = false;
							getTasks();
						}
					}
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
							{taskValue}
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
