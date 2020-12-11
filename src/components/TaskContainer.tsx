import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { defualtFirebase, dbService } from '../fbase';
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

	const onClearClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const completedDoc = dbService.doc(`${userInfo.uid}/완료`);
			try {
				await completedDoc.delete();
			} catch (err) {
				alert(err.message);
			} finally {
				getTasks();
			}
		}
	};

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
			<TitleWrapper>
				<Dates isPast={isPast}>{date === todaysDate ? '오늘' : date}</Dates>
				{date === '완료' ? <ClearBtn onClick={onClearClick}>비우기</ClearBtn> : ''}
			</TitleWrapper>
			<TasksWrapper>
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
			</TasksWrapper>
		</Container>
	);
};
const Container = styled.article`
	margin: 1rem 0;
`;

const TitleWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 1.5rem;
	margin-bottom: 0.5rem;
`;

const Dates = styled.h4<{ isPast: boolean }>`
	color: ${props => (props.isPast ? props.theme.light.blackColor : props.theme.light.whiteColor)};
	font-weight: bold;
`;

const ClearBtn = styled.button`
	outline: none;
	border: 2px solid ${props => props.theme.light.grayColor};
	border-radius: 15px;
	background-color: transparent;
	font-weight: 700;
	font-size: 0.7rem;
	color: ${props => props.theme.light.grayColor};
`;

const TasksWrapper = styled.div``;

export default TaskContainer;
