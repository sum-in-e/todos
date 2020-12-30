import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import Task from './Task';
import CompletedTask from './CompletedTask';
import { TriangleDown } from 'styled-icons/entypo';

interface IProps {
	date: string;
	tasks: { taskKey: string; taskValue: string };
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	taskList: any[];
	setTaskList: React.Dispatch<React.SetStateAction<any[]>>;
}

const TaskContainer: React.FunctionComponent<IProps> = ({ date, tasks, userInfo, taskList, setTaskList }) => {
	const [isPast, setIsPast] = useState<boolean>(false);
	const today = new Date();
	const dd = today.getDate();
	const mm = today.getMonth() + 1;
	const yyyy = today.getFullYear();
	const todaysDate = `${yyyy}-${mm < 10 ? `0${mm}` : mm}-${dd < 10 ? `0${dd}` : dd}`;

	console.log('TaskContainer.tsx 실행');

	const onClickClear = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const copyedTaskList = JSON.parse(JSON.stringify(taskList));
			const docIndex = copyedTaskList.findIndex(
				(Sequence: { date: string; tasks: { task: string } }) => Sequence.date === date,
			);
			copyedTaskList.splice(docIndex, 1);
			try {
				await dbService.doc(`${userInfo.uid}/완료`).delete();
				setTaskList(copyedTaskList);
			} catch (err) {
				alert('오류로 인해 비우기에 실패하였습니다. 재시도 해주세요.');
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
				<TheLeft>
					<Title>{date === todaysDate ? '오늘' : date}</Title>
					{isPast ? <NotifyPastTask isPast={isPast}>[지연된 할 일]</NotifyPastTask> : ''}
				</TheLeft>
				{date === '완료' ? <ClearBtn onClick={onClickClear}>비우기</ClearBtn> : ''}
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
								taskList={taskList}
								setTaskList={setTaskList}
							/>
					  ))
					: Object.entries(tasks).map(([taskKey, taskValue]) => (
							<Task
								key={uuidv4()}
								date={date}
								taskKey={taskKey}
								taskValue={taskValue}
								userInfo={userInfo}
								taskList={taskList}
								setTaskList={setTaskList}
							/>
					  ))}
			</TasksWrapper>
		</Container>
	);
};

const Container = styled.article`
	display: flex;
	flex-direction: column;
	margin: 1rem 0;
`;

const TitleWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 1.5rem;
	margin-bottom: 0.5rem;
`;

const TheLeft = styled.div`
	display: flex;
	align-items: center;
`;

const Title = styled.h4`
	margin-right: 0.5rem;
	color: ${props => props.theme.light.whiteColor};
	font-weight: bold;
`;

const NotifyPastTask = styled.span<{ isPast: boolean }>`
	font-weight: 700;
	font-size: 0.6rem;
	color: ${props => props.theme.light.yellowColor};
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

export default React.memo(TaskContainer);
