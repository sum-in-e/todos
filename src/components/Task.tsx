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
				// 날짜 수정 안한 경우 -> 값만 update 하면 됨
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
				// 날짜 수정한 경우 -> 수정된 날짜의 doc이 존재하는 경우와, 수정된 날짜의 doc이 존재하지 않는 경우로 나눔
				const userCollection = await dbService.collection(userInfo.uid).get();
				const docList = userCollection.docs.map(doc => doc.id);
				try {
					// 수정된 날짜의 doc이 존재하는 경우
					if (docList.includes(editedDate)) {
						// 수정된 날짜의 doc에 새롭게 변경된 inputValue와 editedDate 넣어서 업데이트
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
						// 수정된 날짜의 doc이 존재하지 않는 경우
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
					// 기존 날짜의 doc에서 이전 task 제거
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
					<div>{task}</div>
					<button onClick={onToggleClick}>수정</button>
					<button onClick={onDeleteClick}>삭제</button>
				</Container>
			)}
		</>
	);
};

const Container = styled.div``;

export default Task;
