import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import TaskContainer from './TaskContainer';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
}

const Tasks: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [isLimited, setIsLimited] = useState<boolean>(false);
	const [count, setCount] = useState<number>(30);
	const [date, setDate] = useState<string>('날짜미정');
	const [taskList, setTaskList] = useState<any[]>([]);
	const temporaryStorage: any[] = [];

	const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		const length = value.length;

		if (length < 31) {
			setInputValue(value);
			setCount(30 - length);
			if (length === 30) {
				setIsLimited(true);
			}
		}
	};

	const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setDate(value === '' ? '날짜미정' : value);
	};

	const onSubmitTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const copyedTaskList = taskList.slice();
			const docList = copyedTaskList.map(doc => doc.date);
			try {
				if (docList.includes(date)) {
					const docIndex = copyedTaskList.findIndex(Sequence => Sequence.date === date);
					const data = copyedTaskList[docIndex].tasks;
					const dataLength = Object.keys(data).length;
					const taskObj = {
						date,
						tasks: {
							...data,
							[dataLength]: inputValue,
						},
					};
					copyedTaskList.splice(docIndex, 1, taskObj);
					dbService.doc(`${userInfo.uid}/${date}`).update({ [dataLength]: inputValue });
				} else {
					const taskObj = {
						date: date,
						tasks: {
							0: inputValue,
						},
					};
					copyedTaskList.push(taskObj);
					copyedTaskList.sort(function (a, b) {
						return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
					});
					dbService.collection(userInfo.uid).doc(date).set({
						0: inputValue,
					});
				}
			} catch (err) {
				alert(err.message);
			} finally {
				setTaskList(copyedTaskList);
				setIsLimited(false);
				setCount(30);
				setInputValue('');
				setDate('날짜미정');
			}
		}
	};

	useEffect(() => {
		const getTasks = async (): Promise<void> => {
			if (userInfo.uid !== null) {
				const userCollection = await dbService.collection(userInfo.uid).get();
				if (!userCollection.empty) {
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
								alert(err.message);
							}
						},
					);
					setTaskList(temporaryStorage);
				} else {
					setTaskList([]);
				}
				console.log('getTask 실행');
			}
		};
		getTasks();
	}, []);

	return (
		<Container>
			<AddTaskWrapper>
				<Shape />
				<TaskForm onSubmit={onSubmitTask}>
					<WriteTask
						type="text"
						placeholder="Add Task"
						value={inputValue}
						onChange={onChangeInput}
						required
						autoFocus
					/>
					<Counter isLimited={isLimited}>{count}</Counter>
					<TaskDate type="date" value={date === '날짜미정' ? '' : date} onChange={onChangeDate} />
					<SubmitTask type="submit" value="추가" />
				</TaskForm>
			</AddTaskWrapper>
			<TaskListWrapper>
				{taskList &&
					taskList.length > 0 &&
					taskList.map((result: { date: string; tasks: { taskKey: string; taskValue: string } }) => (
						<TaskContainer
							key={uuidv4()}
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
	overflow: scroll;
	height: 75vh;
	margin-top: 12vh;
	margin-bottom: 13vh;
	-ms-overflow-style: none;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		display: none;
	}
`;

/* ********************* Add Task Wrapper ********************* */
const AddTaskWrapper = styled.section`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 2.3rem;
	padding: 0.5rem 1rem;
	border-bottom: 1px solid ${props => props.theme.light.grayColor};
`;

const Shape = styled.div`
	height: 24px;
	width: 24px;
	background-color: transparent;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.light.whiteColor};
`;

const TaskForm = styled.form`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 95%;
`;

const Counter = styled.div<{ isLimited: boolean }>`
	height: inherit;
	padding: 0 0.3rem;
	margin: 0 0.5rem;
	border: 1px solid ${props => (props.isLimited ? props.theme.light.yellowColor : props.theme.light.whiteColor)};
	border-radius: 5px;
	font-size: 0.7rem;
	color: ${props => (props.isLimited ? props.theme.light.yellowColor : props.theme.light.whiteColor)};
`;

const WriteTask = styled.input`
	width: 90%;
	outline: none;
	border: none;
	background-color: ${props => props.theme.light.greenColor};
	color: ${props => props.theme.light.whiteColor};
`;

const TaskDate = styled.input`
	padding: 0 1rem;
	border: none;
	border-right: 1px solid ${props => props.theme.light.grayColor};
	border-left: 1px solid ${props => props.theme.light.grayColor};
	background-color: transparent;
	font-size: 0.7rem;
	color: white;
`;

const SubmitTask = styled.input`
	font-size: 0.7rem;
	padding-left: 1rem;
	outline: none;
	border: none;
	background-color: ${props => props.theme.light.greenColor};
	color: ${props => props.theme.light.whiteColor};
`;

/* ********************* Task Wrapper ********************* */
const TaskListWrapper = styled.section`
	z-index: -1;
	padding: 0 1rem;
`;
export default Tasks;
