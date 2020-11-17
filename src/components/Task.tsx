import React, { useState } from 'react';
import styled from 'styled-components';
import { defualtFirebase, dbService } from '../fbase';

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
	const [toggleEdit, setToggleEdit] = useState<boolean>(false);

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
			for (const key in docData) {
				if (docData[key] === task) {
					await theDoc.update({
						[key]: inputValue,
					});
					await getTasks();
				}
			}
			setToggleEdit(prev => !prev);
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
