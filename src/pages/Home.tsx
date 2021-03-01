import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import Header from '../components/Header';
import TaskContainer from '../components/reusable/TaskContainer';
import AddTask from '../components/AddTask';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	reRender: () => void;
}

interface ITaskList {
	date: string;
	tasks: { (key: number): string };
}

const Home: React.FunctionComponent<IProps> = ({ userInfo, reRender }) => {
	const [taskList, setTaskList] = useState<ITaskList[]>([]);
	const temporaryStorage: any[] = [];

	useEffect(() => {
		const getTasks = async (): Promise<void> => {
			('');
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
									console.log(temporaryStorage);
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
			<Header userInfo={userInfo} reRender={reRender} />
			<Tasks>
				<AddTaskWrapper>
					<AddTask userInfo={userInfo} taskList={taskList} setTaskList={setTaskList} />
				</AddTaskWrapper>
				<TaskListWrapper>
					{taskList &&
						taskList.length > 0 &&
						taskList.map(result => (
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
			</Tasks>
		</Container>
	);
};

const Container = styled.div`
	position: fixed;
	width: 100vw;
	height: 100vh;
	height: calc(var(--vh, 1vh) * 100);
	background-color: ${props => props.theme.light.mainColor};
`;

const Tasks = styled.main`
	position: relative;
	overflow: scroll;
	height: 88vh;
	height: calc(var(--vh, 1vh) * 88);
	margin-top: 12vh;
	margin-top: calc(var(--vh, 1vh) * 12);
	scrollbar-width: none;
	-ms-overflow-style: none;
	&::-webkit-scrollbar {
		display: none;
	}
	font-size: 0.8rem;
	${({ theme }) => theme.media.landscapeMobile`
		height : 82vh;
		height: calc(var(--vh, 1vh) * 82);
		margin-top : 18vh;
		margin-top: calc(var(--vh, 1vh) * 18);
		${{ 'border-left': `1px solid ${theme.light.lineColor}` }};
		${{ 'border-right': `1px solid ${theme.light.lineColor}` }};
	`}
	${({ theme }) => theme.media.portraitTablet`		
		heigth : 90vh;
		height: calc(var(--vh, 1vh) * 90);
		margin-top : 10vh;
		margin-top: calc(var(--vh, 1vh) * 10);
	`}
	${({ theme }) => theme.media.desktop`		
		heigth : 85vh;
		margin-top : 15vh;
	`}
`;

/* ********************* Add Task Wrapper ********************* */
const AddTaskWrapper = styled.section`
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: fixed;
	top: 12vh;
	top: calc(var(--vh, 1vh) * 12);
	left: 0;
	width: 100%;
	z-index: 1;
	background-color: ${props => props.theme.light.mainColor};
	${({ theme }) => theme.media.landscapeMobile`		
		top : 18vh;
		top: calc(var(--vh, 1vh) * 18);
	`}
	${({ theme }) => theme.media.portraitTablet`		
		top : 10vh;
		top: calc(var(--vh, 1vh) * 10);

	`}
	${({ theme }) => theme.media.desktop`		
		top : 15vh;
	`}
`;

/* ********************* TaskList Wrapper ********************* */
const TaskListWrapper = styled.section`
	z-index: -1;
	padding: 0 1rem 1rem 1rem;
	margin-top: calc(var(--vh, 1vh) * 20);
	${({ theme }) => theme.media.landscapeMobile`
		padding: 0 0.5rem 1rem 0.5rem;
		margin-top: calc(var(--vh, 1vh) * 15);
	`}
	${({ theme }) => theme.media.portraitTabletS`
		padding: 0 1.5rem 1rem 1.5rem;
		margin-top: calc(var(--vh, 1vh) * 17);

	`}
	${({ theme }) => theme.media.portraitTablet`
		margin-top: calc(var(--vh, 1vh) * 5);
	`}
	${({ theme }) => theme.media.landscapeTablet`
		margin-top: calc(var(--vh, 1vh) * 7);
	`}
	${({ theme }) => theme.media.desktop`
		margin-top: calc(var(--vh, 1vh) * 7);
	`}
`;

export default Home;
