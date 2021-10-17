import React, { useEffect, useContext } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import Header from '../components/Header';
import TaskContainer from '../components/reusable/TaskContainer';
import AddTask from '../components/AddTask';
import { UserStateContext } from '../components/App';
import { useTaskListState, useTaskListDispatch } from '../context/TaskListContext';
import { doc, deleteDoc, collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const Home: React.FunctionComponent = () => {
	const taskListState = useTaskListState();
	const taskListDispatch = useTaskListDispatch();
	const userInfo = useContext(UserStateContext);

	useEffect(() => {
		const getTasks = async (): Promise<void> => {
			if (userInfo.uid !== null) {
				const userCollection = await getDocs(collection(dbService, userInfo.uid));
				const temporaryStorage: any[] = [];

				if (!userCollection.empty) {
					// 유저 데이터 있음
					userCollection.forEach(
						async (userDoc: QueryDocumentSnapshot<DocumentData>): Promise<void> => {
							const docDate = userDoc.id;
							const tasks = userDoc.data();
							const taskValues = Object.values(userDoc.data());
							try {
								if (taskValues.length > 0) {
									const taskObj = {
										date: docDate,
										tasks,
									};
									await temporaryStorage.push(taskObj);
								} else if (taskValues.length === 0) {
									if (docDate && userInfo.uid) {
										await deleteDoc(doc(dbService, userInfo.uid, docDate));
									}
								}
							} catch (err) {
								alert('오류로 인해 불러오기에 실패하였습니다. 페이지를 새로고침 합니다.');
								temporaryStorage.length = 0;
								window.location.reload();
							}
						},
					);
					taskListDispatch({
						type: 'SET_TASKLIST',
						taskList: temporaryStorage,
					});
				} else {
					// 유저 데이터 없음 -> 새로운 유저 / 데이터 하나도 없는 유저
					taskListDispatch({
						type: 'SET_TASKLIST',
						taskList: [],
					});
				}
			}
		};
		getTasks();
	}, []);

	return (
		<Container>
			<Header />
			<Tasks>
				<AddTaskWrapper>
					<AddTask />
				</AddTaskWrapper>
				<TaskListWrapper>
					{taskListState &&
						taskListState.taskList.length > 0 &&
						taskListState.taskList.map(result => (
							<TaskContainer key={result.date} date={result.date} tasks={result.tasks} />
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
		height : 90vh;
		height: calc(var(--vh, 1vh) * 90);
		margin-top : 10vh;
		margin-top: calc(var(--vh, 1vh) * 10);
	`}
	${({ theme }) => theme.media.desktop`		
		height : 85vh;
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
