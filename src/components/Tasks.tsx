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
	const [date, setDate] = useState<string>('날짜미정');
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

			if (userCollection.empty) {
				// doc이 없는 경우
				console.log('Collection 안에 없음');
				await dbService.collection(userInfo.uid).doc(date).set({
					1: inputValue,
				});
				// 리얼타임처럼 화면에 실시간으로 반영되게 하기 -> setState
				await taskArray.push({
					date: date,
					tasks: [inputValue],
				});
				setTaskList(taskArray);
				// inputValue, date setState해서 각각의 uesState 및 input 값 초기화 시키기
				setInputValue('');
				setDate('날짜미정');
			} else {
				// doc이 하나이상 있는 경우
				console.log('Collection 안에 있음');
				userCollection.docs.forEach(
					async (result): Promise<void> => {
						if (result.id === date) {
							// 제출한 날짜와 같은 날짜를 가진 doc이 있으면 해당 doc면 콘솔 뜸(같은 날짜 가진 doc 없으면 이 부분 실행 안 됨)
							// 기존에 doc에 있던 data와, 새롭게 입력한 데이터를 taskObj로 구성해서 update.
							const data = result.data();
							const dataLength = Object.keys(data).length;
							const taskObj = {
								...data,
								[dataLength + 1]: inputValue,
							};
							await result.ref.update(taskObj);
							// 리얼타임처럼 setState 시켜야 함
							await getTasks();
							// inputValue, date setState해서 각각의 uesState 및 input 값 초기화 시키기
							setInputValue('');
							setDate('날짜미정');
						}
					},
				);
				// 지정한 날짜와 일치하는 doc이 없는 경우판별한 후 set하게 만들면 됨
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
					async (docOfDate): Promise<void> => {
						const docDate = docOfDate.id;
						const tasks = Object.values(docOfDate.data());
						const taskObj = {
							date: docDate,
							tasks: tasks,
						};
						await taskArray.push(taskObj);
						setTaskList(taskArray);
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
							<Task key={result.date} date={result.date} tasks={result.tasks} />
						))}
				</div>
			</Container>
		</>
	);
};

const Container = styled.div``;

export default Tasks;
