import React, { useState } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	taskList: any[];
	setTaskList: React.Dispatch<React.SetStateAction<any[]>>;
}

const AddTask: React.FunctionComponent<IProps> = ({ userInfo, taskList, setTaskList }) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [date, setDate] = useState<string>('날짜미정');

	const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
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
			const copyedTaskList = JSON.parse(JSON.stringify(taskList));
			const docList = copyedTaskList.map((doc: { date: string; tasks: { task: string } }) => doc.date);
			try {
				if (docList.includes(date)) {
					const docIndex = copyedTaskList.findIndex(
						(doc: { date: string; tasks: { task: string } }) => doc.date === date,
					);
					const data = copyedTaskList[docIndex].tasks;
					const dataLength = Object.keys(data).length;
					await dbService.doc(`${userInfo.uid}/${date}`).update({ [dataLength]: inputValue });
					const taskObj = {
						date,
						tasks: {
							...data,
							[dataLength]: inputValue,
						},
					};
					copyedTaskList.splice(docIndex, 1, taskObj);
				} else {
					await dbService.collection(userInfo.uid).doc(date).set({
						0: inputValue,
					});
					const taskObj = {
						date: date,
						tasks: {
							0: inputValue,
						},
					};
					copyedTaskList.push(taskObj);
					copyedTaskList.sort(function (
						a: { date: string; tasks: { task: string } },
						b: { date: string; tasks: { task: string } },
					) {
						return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
					});
				}
			} catch (err) {
				alert('오류로 인해 저장에 실패하였습니다. 재시도 해주세요.');
			} finally {
				setTaskList(copyedTaskList);
				setInputValue('');
				setDate('날짜미정');
			}
		}
	};

	return (
		<>
			<TaskForm onSubmit={onSubmitTask}>
				<TaskWrapper>
					<Shape />
					<TaskInput
						type="text"
						placeholder="Add Task"
						value={inputValue}
						onChange={onChangeInput}
						maxLength={50}
						required
						autoFocus
					/>
				</TaskWrapper>
				<ExceptTaskInput>
					<DateInput type="date" value={date === '날짜미정' ? '' : date} onChange={onChangeDate} />
					<SubmitInput type="submit" value="추가" />
				</ExceptTaskInput>
			</TaskForm>
		</>
	);
};

export default AddTask;

const TaskForm = styled.form`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

/* ********************* Write Task Wrapper ********************* */
const TaskWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 2rem;
	width: 100%;
`;

const Shape = styled.div`
	height: 24px;
	width: 24px;
	background-color: transparent;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.light.whiteColor};
`;

const TaskInput = styled.input`
	width: 90%;
	outline: none;
	border: none;
	background-color: ${props => props.theme.light.greenColor};
	color: ${props => props.theme.light.whiteColor};
`;

/* ********************* Except Write Task ********************* */
const ExceptTaskInput = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	height: 2rem;
	padding-top: 0.5rem;
	border-top: 2px solid ${props => props.theme.light.grayColor};
`;

const DateInput = styled.input`
	width: 80%;
	padding: 0 0.5rem;
	border: none;
	border-right: 2px solid ${props => props.theme.light.grayColor};
	background-color: transparent;
	color: white;
	${({ theme }) => theme.media.portraitTablet`
		border-left: 2px solid ${theme.light.grayColor};
	`}
`;

const SubmitInput = styled.input`
	padding: 0 1rem;
	outline: none;
	border: none;
	background-color: ${props => props.theme.light.greenColor};
	color: ${props => props.theme.light.whiteColor};
`;