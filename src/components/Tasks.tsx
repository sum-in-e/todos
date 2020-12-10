import React, { useState, useEffect, useRef } from 'react';
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
	const [date, setDate] = useState<string>('날짜미정');
	const [taskList, setTaskList] = useState<any[]>([]);
	const temporaryStorage: any[] = [];

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
		setDate(value === '' ? '날짜미정' : value);
	};

	const onTaskSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const userCollection = await dbService.collection(userInfo.uid).get();
			const docList = userCollection.docs.map(doc => doc.id);
			try {
				if (docList.includes(date)) {
					const doc = dbService.doc(`${userInfo.uid}/${date}`);
					const data = (await doc.get()).data();
					if (data !== undefined) {
						const dataLength = Object.keys(data).length;
						const taskObj = {
							...data,
							[dataLength]: inputValue,
						};
						const num = taskList.findIndex(Sequence => Sequence.date === date);
						taskList.splice(num, 1, { date, tasks: taskObj });
						doc.update(taskObj);
					}
				} else {
					await dbService.collection(userInfo.uid).doc(date).set({
						0: inputValue,
					});
					getTasks();
				}
			} catch (err) {
				alert(err.message);
			} finally {
				setInputValue('');
				setDate('날짜미정');
			}
		}
	};

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

	useEffect(() => {
		getTasks();
	}, []);

	return (
		<Container>
			<AddTaskWrapper>
				<Shape />
				<TaskForm onSubmit={onTaskSubmit}>
					<WriteTask
						type="text"
						placeholder="Add Task"
						value={inputValue}
						onChange={onInputChange}
						required
						autoFocus
					/>
					<TaskDate type="date" value={date === '날짜미정' ? '' : date} onChange={onDateChange} />
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
							getTasks={getTasks}
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
const TaskForm = styled.form`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 95%;
`;

const Shape = styled.div`
	height: 24px;
	width: 24px;
	background-color: transparent;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.light.whiteColor};
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
