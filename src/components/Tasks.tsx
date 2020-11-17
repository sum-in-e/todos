import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import TaskContainer from './TaskContainer';

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
		setDate(value);
	};

	const onTaskSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const userCollection = await dbService.collection(userInfo.uid).get();
			const docList = userCollection.docs.map(doc => doc.id);

			if (docList.includes(date)) {
				console.log('일치하는 doc 있음');
				userCollection.docs.forEach(
					async (result): Promise<void> => {
						if (result.id === date) {
							const data = result.data();
							const dataLength = Object.keys(data).length;
							const taskObj = {
								...data,
								[dataLength + 1]: inputValue,
							};
							await result.ref.update(taskObj);
							await getTasks();
							setInputValue('');
							setDate('날짜미정');
						}
					},
				);
			} else {
				console.log('일치하는 doc 없음');
				await dbService.collection(userInfo.uid).doc(date).set({
					1: inputValue,
				});
				await getTasks();
				setInputValue('');
				setDate('날짜미정');
			}
		}
	};

	const getTasks = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			// userId를 가진 collection 가져오기
			const userCollection = await dbService.collection(userInfo.uid).get();
			// doc이 없는 경우 작동 안 함.
			if (!userCollection.empty) {
				// 유저의 collection에 forEach해서 날짜별 doc을 가져옴
				userCollection.forEach(
					async (doc): Promise<void> => {
						const docDate = doc.id;
						const tasks = Object.values(doc.data());
						const taskObj = {
							date: docDate,
							tasks: tasks,
						};
						await temporaryStorage.push(taskObj);
						setTaskList(temporaryStorage);
					},
				);
			}
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
							/>
						))}
				</div>
			</Container>
		</>
	);
};

const Container = styled.div``;

export default Tasks;
