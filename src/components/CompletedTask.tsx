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

const CompletedTask: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue, userInfo, getTasks }) => {
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
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

	const onDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			try {
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
				getTasks();
			}
		}
	};

	const onDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setEditedDate(value === '' ? '날짜미정' : value);
	};

	const onRestoreClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const userCollection = await dbService.collection(userInfo.uid).get();
			const docList = userCollection.docs.map(doc => doc.id);
			if (docList.includes(editedDate)) {
				const doc = await dbService.doc(`${userInfo.uid}/${editedDate}`).get();
				const data = doc.data();
				const completeDoc = dbService.doc(`${userInfo.uid}/${date}`);
				const completeDocData = (await completeDoc.get()).data();
				if (data !== undefined) {
					const dataLength = Object.keys(data).length;
					const taskObj = {
						...data,
						[dataLength]: taskValue,
					};
					try {
						await doc.ref.update(taskObj);
						for (const key in completeDocData) {
							if (key === taskKey) {
								await completeDoc.update({
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
				const completeDoc = dbService.doc(`${userInfo.uid}/${date}`);
				const completeDocData = (await completeDoc.get()).data();
				try {
					await dbService.collection(userInfo.uid).doc(editedDate).set({
						0: taskValue,
					});
					for (const key in completeDocData) {
						if (key === taskKey) {
							await completeDoc.update({
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
	};

	return (
		<>
			<Container>
				<div>{taskValue}</div>
				<input type="date" value={editedDate === '날짜미정' ? '' : editedDate} onChange={onDateChange} />
				<button onClick={onRestoreClick}>복구</button>
				<button onClick={onDeleteClick}>삭제</button>
			</Container>
		</>
	);
};

const Container = styled.div``;

export default CompletedTask;
