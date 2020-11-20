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

const CompletedTask: React.FunctionComponent<IProps> = ({ date, task, userInfo, getTasks }) => {
	const [editedDate, setEditedDate] = useState<string>('날짜미정');

	const onDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const theDoc = dbService.doc(`${userInfo.uid}/${date}`);
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

	const onDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setEditedDate(value === '' ? '날짜미정' : value);
	};

	const onRestoreClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
		if (userInfo.uid !== null) {
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
									[uuidv4()]: task,
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
							[uuidv4()]: task,
						});
				}
			} catch (err) {
				console.log(err);
			} finally {
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
		}
	};

	return (
		<>
			<Container>
				<div>{task}</div>
				<input type="date" value={editedDate === '날짜미정' ? '' : editedDate} onChange={onDateChange} />
				<button onClick={onRestoreClick}>복구</button>
				<button onClick={onDeleteClick}>삭제</button>
			</Container>
		</>
	);
};

const Container = styled.div``;

export default CompletedTask;
