import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import TaskContainer from './TaskContainer';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: object) => void;
	};
}

const Tasks: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [date, setDate] = useState<string>('날짜미정');
	const [taskList, setTaskList] = useState<string[]>([]);
	const temporaryStorage: any = [];

	const today = new Date();
	const dd = today.getDate();
	const mm = today.getMonth() + 1;
	const yyyy = today.getFullYear();
	const todaysDate = `${yyyy}-${mm < 10 ? `0${mm}` : mm}-${dd < 10 ? `0${dd}` : dd}`;

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
		setDate(value === '' ? '날짜미정' : value);
	};

	const onTaskSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const userCollection = await dbService.collection(userInfo.uid).get();
			const docList = userCollection.docs.map(doc => doc.id);

			if (docList.includes(date)) {
				userCollection.docs.forEach(
					async (result): Promise<void> => {
						if (result.id === date) {
							const data = result.data();
							const taskObj = {
								...data,
								[uuidv4()]: inputValue,
							};
							await result.ref.update(taskObj);
							await getTasks();
							setInputValue('');
							setDate('날짜미정');
						}
					},
				);
			} else {
				await dbService
					.collection(userInfo.uid)
					.doc(date)
					.set({
						[uuidv4()]: inputValue,
					});
				await getTasks();
				setInputValue('');
				setDate('날짜미정');
			}
		}
	};

	const getTasks = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const userCollection = await dbService.collection(userInfo.uid).get();
			if (!userCollection.empty) {
				userCollection.forEach(
					async (doc): Promise<void> => {
						const docDate = doc.id;
						const tasks = Object.values(doc.data());
						if (tasks.length > 0) {
							const taskObj = {
								date: docDate,
								tasks: tasks,
							};
							await temporaryStorage.push(taskObj);
						} else if (tasks.length === 0) {
							await doc.ref.delete();
						}
					},
				);
			}
			setTaskList(temporaryStorage);
		}
	};

	useEffect(() => {
		getTasks();
	}, []);

	return (
		<>
			<Container>
				<div>
					<form onSubmit={onTaskSubmit}>
						<input
							type="text"
							placeholder="New Task"
							value={inputValue}
							onChange={onInputChange}
							required
						/>
						<input type="date" value={date === '날짜미정' ? '' : date} onChange={onDateChange} />
						<input type="submit" value="Save" />
					</form>
				</div>
				<div>
					{taskList &&
						taskList.length > 0 &&
						taskList.map((result: any) => (
							<TaskContainer
								key={result.date}
								date={result.date}
								tasks={result.tasks}
								userInfo={userInfo}
								getTasks={getTasks}
								todaysDate={todaysDate}
							/>
						))}
				</div>
			</Container>
		</>
	);
};

const Container = styled.div``;

export default Tasks;
