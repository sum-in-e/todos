import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import TaskContainer from './TaskContainer';
import AddTask from './AddTask';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
}

const Tasks: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [taskList, setTaskList] = useState<any[]>([]);
	const temporaryStorage: any[] = [];

	console.log('Tasks.tsx 렌더링, taskList :', taskList);

	useEffect(() => {
		const getTasks = async (): Promise<void> => {
			if (userInfo.uid !== null) {
				const userCollection = await dbService.collection(userInfo.uid).get();
				if (!userCollection.empty) {
					// 유저 데이터 있음
					userCollection.forEach(
						async (
							doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>,
						): Promise<void> => {
							const docDate = doc.id;
							const tasks = doc.data();
							const taskValues = Object.values(doc.data());
							try {
								if (taskValues.length > 0) {
									const taskObj = {
										date: docDate,
										tasks,
									};
									await temporaryStorage.push(taskObj);
								} else if (taskValues.length === 0) {
									doc.ref.delete();
								}
							} catch (err) {
								alert('오류로 인해 불러오기에 실패하였습니다. 페이지를 새로고침 합니다.');
								temporaryStorage.length = 0;
								window.location.reload();
							}
						},
					);
					setTaskList(temporaryStorage);
				} else {
					// 유저 데이터 없음 -> 새로운 유저 / 데이터 하나도 없는 유저
					setTaskList([]);
				}
			}
		};
		getTasks();
	}, []);

	return (
		<Container>
			<AddTaskWrapper>
				<AddTask userInfo={userInfo} taskList={taskList} setTaskList={setTaskList} />
			</AddTaskWrapper>
			<TaskListWrapper>
				{taskList &&
					taskList.length > 0 &&
					taskList.map((result: { date: string; tasks: { taskKey: string; taskValue: string } }) => (
						<TaskContainer
							key={result.date}
							date={result.date}
							tasks={result.tasks}
							userInfo={userInfo}
							taskList={taskList}
							setTaskList={setTaskList}
						/>
					))}
			</TaskListWrapper>
		</Container>
	);
};

const Container = styled.main`
	position: relative;
	overflow: scroll;
	height: 88vh;
	margin-top: 12vh;
	-ms-overflow-style: none;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		display: none;
	}
	font-size: 0.8rem;
	${({ theme }) => theme.media.landscapeMobile`
		height : 79vh;
		margin-top : 21vh;
		border-left : 1px solid  #caccd1;
		border-right : 1px solid #caccd1;
	`}
`;

/* ********************* Add Task Wrapper ********************* */
const AddTaskWrapper = styled.section`
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: fixed;
	top: 12vh;
	left: 0;
	width: 100%;
	z-index: 1;
	background-color: ${props => props.theme.light.greenColor};
	${({ theme }) => theme.media.landscapeMobile`		
		top : 21vh;
	`}
`;

/* ********************* TaskList Wrapper ********************* */
const TaskListWrapper = styled.section`
	z-index: -1;
	padding: 0 1rem 1rem 1rem;
	margin-top: 5rem;
	${({ theme }) => theme.media.landscapeMobile`
		padding: 0 0.5rem 1rem 0.5rem;
		margin-top: 2.5rem;
	`}
`;

export default React.memo(Tasks);
