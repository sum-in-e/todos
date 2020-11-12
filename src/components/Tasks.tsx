import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import Task from './Task';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: object) => void;
	};
}

const Tasks: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [date, setDate] = useState<string>('');
	const [taskList, setTaskList] = useState<[]>([]);
	const taskArray: any = [];

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
			// userId를 가진 doc을 가져옴
			const userCollection = await dbService.collection(userInfo.uid).get();
			// doc이 없는 경우
			if (userCollection.empty) {
				console.log('Collection 안에 없음');
				await dbService
					.collection(userInfo.uid)
					.doc(date === '' ? '미정' : date)
					.set({
						1: inputValue,
					});
				// 리얼타임처럼 화면에 실시간으로 반영되게 하기 -> setState
				await taskArray.push({
					date: date === '' ? '미정' : date,
					tasks: [inputValue],
				});
				setTaskList(taskArray);
				// inputValue, date setState해서 각각의 uesState 및 input 값 초기화 시키기
				setInputValue('');
				setDate('');
			} else {
				// doc이 하나이상 있는 경우
				console.log('Collection 안에 있음');
			}
		}
	};

	useEffect(() => {
		/* const getTasks = async (): Promise<void> => {
			if (userInfo.uid !== null) {
				// userId를 가진 collection 가져오기
				const userCollection = await dbService.collection(userInfo.uid).get();
				if (!userCollection.empty) {
					// 유저의 collection에 forEach해서 날짜별 doc을 가져옴
					userCollection.forEach(
						async (docOfDate): Promise<void> => {
							const date = docOfDate.id;
							const tasks = Object.values(docOfDate.data());
							const taskObj = {
								date: date,
								tasks: tasks,
							};
							await taskArray.push(taskObj);
							setTaskList(taskArray);
						},
					);
				}
			}
		};
		getTasks(); */
	}, []);

	return (
		<>
			<Container>
				<div>
					<form onSubmit={onTaskSubmit}>
						<input type="text" placeholder="New Task" value={inputValue} onChange={onInputChange} />
						<input type="date" value={date} onChange={onDateChange} />
						<input type="submit" value="Save" />
					</form>
				</div>
				<div>
					{taskList &&
						taskList.length > 0 &&
						taskList.map((result: any) => (
							<Task key={result.date} date={result.date} tasks={result.tasks} />
						))}
				</div>
			</Container>
		</>
	);
};

const Container = styled.div``;

export default Tasks;
