import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Task from './Task';
import { dbService } from '../fbase';
import CompletedTask from './CompletedTask';

interface IProps {
	date: string;
	tasks: string[];
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: object) => void;
	};
	getTasks: () => void;
	todaysDate: string;
}

const TaskContainer: React.FunctionComponent<IProps> = ({ date, tasks, userInfo, getTasks, todaysDate }) => {
	const [isPast, setIsPast] = useState<boolean>(false);

	const identification = async (): Promise<void> => {
		const todayArr = todaysDate.split('-');
		const changeToday = new Date(parseInt(todayArr[0]), parseInt(todayArr[1]) - 1, parseInt(todayArr[2]));
		const changedToday = changeToday.setDate(changeToday.getDate());
		if (userInfo.uid !== null) {
			const userCollection = await dbService.collection(userInfo.uid).get();

			userCollection.docs.forEach(
				async (doc): Promise<void> => {
					if (doc.id !== '과거' && doc.id !== '완료' && doc.id !== '날짜미정' && doc.id === date) {
						const dateArr = doc.id.split('-');
						const changeDate = new Date(
							parseInt(dateArr[0]),
							parseInt(dateArr[1]) - 1,
							parseInt(dateArr[2]),
						);
						const changedDate = changeDate.setDate(changeDate.getDate());
						if (changedDate < changedToday) {
							setIsPast(true);
						}
					}
				},
			);
		}
	};
	useEffect(() => {
		identification();
	}, []);

	return (
		<>
			<Dates isPast={isPast}>{date === todaysDate ? '오늘' : date}</Dates>
			<div>
				{date === '완료'
					? tasks.map((task: string, index: number) => (
							<CompletedTask
								key={index}
								date={date}
								task={task}
								userInfo={userInfo}
								getTasks={getTasks}
							/>
					  ))
					: tasks.map((task: string, index: number) => (
							<Task key={index} date={date} task={task} userInfo={userInfo} getTasks={getTasks} />
					  ))}
			</div>
		</>
	);
};

const Dates = styled.h3<{ isPast: boolean }>`
	color: ${props => (props.isPast ? 'red' : 'black')};
	font-weight: bold;
`;

export default TaskContainer;
