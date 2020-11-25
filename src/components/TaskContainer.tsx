import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import Task from './Task';
import CompletedTask from './CompletedTask';

interface IProps {
	date: string;
	tasks: { taskKey: string; taskValue: string };
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	getTasks: () => void;
}

const TaskContainer: React.FunctionComponent<IProps> = ({ date, tasks, userInfo, getTasks }) => {
	const [isPast, setIsPast] = useState<boolean>(false);
	const today = new Date();
	const dd = today.getDate();
	const mm = today.getMonth() + 1;
	const yyyy = today.getFullYear();
	const todaysDate = `${yyyy}-${mm < 10 ? `0${mm}` : mm}-${dd < 10 ? `0${dd}` : dd}`;

	const identifyPast = (): void => {
		const todayArr = todaysDate.split('-');
		const changeToday = new Date(parseInt(todayArr[0]), parseInt(todayArr[1]) - 1, parseInt(todayArr[2]));
		const changedToday = changeToday.setDate(changeToday.getDate());
		if (date !== '과거' && date !== '완료' && date !== '날짜미정') {
			const dateArr = date.split('-');
			const changeDate = new Date(parseInt(dateArr[0]), parseInt(dateArr[1]) - 1, parseInt(dateArr[2]));
			const changedDate = changeDate.setDate(changeDate.getDate());
			if (changedDate < changedToday) {
				setIsPast(true);
			}
		}
	};

	useEffect(() => {
		identifyPast();
	}, []);

	return (
		<Container>
			<Dates isPast={isPast}>{date === todaysDate ? '오늘' : date}</Dates>
			<div>
				{date === '완료'
					? Object.entries(tasks).map(([taskKey, taskValue]) => (
							<CompletedTask
								key={uuidv4()}
								date={date}
								taskKey={taskKey}
								taskValue={taskValue}
								userInfo={userInfo}
								getTasks={getTasks}
							/>
					  ))
					: Object.entries(tasks).map(([taskKey, taskValue]) => (
							<Task
								key={uuidv4()}
								date={date}
								taskKey={taskKey}
								taskValue={taskValue}
								userInfo={userInfo}
								getTasks={getTasks}
							/>
					  ))}
			</div>
		</Container>
	);
};
const Container = styled.div``;

const Dates = styled.h3<{ isPast: boolean }>`
	color: ${props => (props.isPast ? 'red' : 'black')};
	font-weight: bold;
`;

export default TaskContainer;
