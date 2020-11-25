import React, { useState } from 'react';
import styled from 'styled-components';
import { defualtFirebase, dbService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';

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

	const onDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			try {
				const theDoc = dbService.doc(`${userInfo.uid}/${date}`);
				const docData = (await theDoc.get()).data();
				for (const key in docData) {
					if (key === taskKey) {
						await theDoc.update({
							[key]: defualtFirebase.firestore.FieldValue.delete(),
						});
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
			try {
				if (docList.includes(editedDate)) {
					const theDoc = await dbService.doc(`${userInfo.uid}/${editedDate}`).get();
					const docData = theDoc.data();
					const taskObj = {
						...docData,
						[uuidv4()]: taskValue,
					};
					await theDoc.ref.update(taskObj);
				} else {
					await dbService
						.collection(userInfo.uid)
						.doc(editedDate)
						.set({
							[uuidv4()]: taskValue,
						});
				}
				const theDoc = dbService.doc(`${userInfo.uid}/${date}`);
				const docData = (await theDoc.get()).data();
				for (const key in docData) {
					if (key === taskKey) {
						await theDoc.update({
							[key]: defualtFirebase.firestore.FieldValue.delete(),
						});
					}
				}
			} catch (err) {
				alert(err.massage);
			} finally {
				getTasks();
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
