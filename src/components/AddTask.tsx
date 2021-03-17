import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/airbnb.css';
import { Clear } from 'styled-icons/material-outlined';
import { UserStateContext } from '../components/App';
import { useTaskListState, useTaskListDispatch } from '../context/TaskListContext';

const AddTask: React.FunctionComponent = () => {
	const taskListState = useTaskListState();
	const taskListDispatch = useTaskListDispatch();
	const userInfo = useContext(UserStateContext);
	const [inputValue, setInputValue] = useState<string>('');
	const [date, setDate] = useState<string>('날짜미정');

	const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
	};

	const onSubmitTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userInfo.uid !== null) {
			const copyedTaskList = JSON.parse(JSON.stringify(taskListState.taskList));
			const docList = copyedTaskList.map((doc: { date: string; tasks: { (key: number): string } }) => doc.date);
			try {
				if (docList.includes(date)) {
					const docIndex = copyedTaskList.findIndex(
						(doc: { date: string; tasks: { (key: number): string } }) => doc.date === date,
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
						a: { date: string; tasks: { (key: number): string } },
						b: { date: string; tasks: { (key: number): string } },
					) {
						return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
					});
				}
			} catch (err) {
				alert('오류로 인해 저장에 실패하였습니다. 재시도 해주세요.');
			} finally {
				taskListDispatch({
					type: 'SET_TASKLIST',
					taskList: copyedTaskList,
				});
				setInputValue('');
				setDate('날짜미정');
			}
		}
	};

	const onClickClear = (): void => {
		setDate('날짜미정');
	};

	flatpickr('#DatePicker', {
		disableMobile: true,
		onChange: function (selectedDates: any, dateStr: string, instance: any) {
			setDate(dateStr === '' ? '날짜미정' : dateStr);
		},
	});

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
					<DateWrapper>
						<DateInput
							id="DatePicker"
							type="text"
							placeholder="Select Date"
							value={date === '날짜미정' ? '' : date}
							data-input
							readOnly
						/>
						<ClearBtn onClick={onClickClear}>
							<ClearI />
						</ClearBtn>
					</DateWrapper>
					<SubmitInput type="submit" value="추가" />
				</ExceptTaskInput>
			</TaskForm>
		</>
	);
};

const TaskForm = styled.form`
	display: flex;
	flex-direction: column;
	width: 100%;
	padding: 0.5rem 1rem 0.8rem 1rem;
	border-bottom: 1px solid ${props => props.theme.light.lineColor};
	${({ theme }) => theme.media.landscapeMobile`
		flex-direction : row;
		padding : 0.5rem;
		border-left : 1px solid #caccd1;
		border-right : 1px solid #caccd1;
	`}
	${({ theme }) => theme.media.portraitTabletS`
		padding: 0.5rem 1.5rem 0.8rem 1.5rem;
	`}
	${({ theme }) => theme.media.portraitTablet`
		flex-direction : row;
		padding: 0.5rem 1rem;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		flex-direction : row;	
		padding: 0.5rem 1rem;
	`}
	${({ theme }) => theme.media.desktop`
		flex-direction : row;
		padding: 0.5rem 1rem;
	`}
`;

/* ********************* Write Task Wrapper ********************* */
const TaskWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 2rem;
	width: 100%;
	${({ theme }) => theme.media.landscapeMobile`
        height : 1.5rem;
	`}
	${({ theme }) => theme.media.portraitTablet`
        height : 1.5rem;
	`}
	${({ theme }) => theme.media.landscapeTablet`
        height : 1.5rem;
	`}
	${({ theme }) => theme.media.desktop`
		height : 1.5rem;
	`}
`;

const Shape = styled.div`
	height: 24px;
	width: 24px;
	background-color: transparent;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.light.textColor};
`;

const TaskInput = styled.input`
	width: 90%;
	outline: none;
	border: none;
	background-color: ${props => props.theme.light.mainColor};
	color: ${props => props.theme.light.textColor};
	&::placeholder {
		color: ${props => props.theme.light.lineColor};
	}
	${({ theme }) => theme.media.landscapeMobile`
		padding-right : 0.5rem;
	`}
	${({ theme }) => theme.media.portraitTabletS`
		width : 93%;
	`}
	${({ theme }) => theme.media.portraitTablet`
		width : 95%;
		padding-right : 0.5rem;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		width : 95%;
		padding-right : 0.5rem;
	`}
	${({ theme }) => theme.media.desktop`
		width : 97%;
		padding-right : 0.5rem;
	`}
`;

/* ********************* Except Write Task ********************* */
const ExceptTaskInput = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	height: 2rem;
	padding-top: 0.5rem;
	border-top: 2px solid ${props => props.theme.light.lineColor};
	${({ theme }) => theme.media.landscapeMobile`
		height : 1.5rem;
        width : 60%;
        border : none;
        padding : 0;
	`}
	${({ theme }) => theme.media.portraitTablet`
		height : 1.5rem;
        width : 60%;
        border : none;
        padding : 0;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		height : 1.5rem;
        width : 45%;
        border : none;
        padding : 0;
	`}
	${({ theme }) => theme.media.desktop`
		height : 1.5rem;
        width : 35%;
        border : none;
        padding : 0;
	`}
`;
const DateWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 80%;
	padding: 0px 0.5rem 0 0;
	border: none;
	border-right: 2px solid ${props => props.theme.light.lineColor};
	background-color: transparent;
	${({ theme }) => theme.media.landscapeMobile`
		padding: 0px 0.5rem;
		${{ 'border-left': ` 2px solid ${theme.light.lineColor}` }};		
		`}
	${({ theme }) => theme.media.portraitTablet`
		padding: 0px 0.5rem;
		${{ 'border-left': ` 2px solid ${theme.light.lineColor}` }};	
		`}
	${({ theme }) => theme.media.landscapeTablet`
		padding: 0px 0.5rem;
		${{ 'border-left': ` 2px solid ${theme.light.lineColor}` }};	
		`}
	${({ theme }) => theme.media.desktop`
		padding: 0px 0.5rem;
		${{ 'border-left': ` 2px solid ${theme.light.lineColor}` }};	
		`}
`;

const DateInput = styled.input`
	width: 80%;
	height: 100%;
	padding: 0.2rem;
	border: 1px solid ${props => props.theme.light.lineColor};
	border-radius: 5px;
	background-color: ${props => props.theme.light.mainColor};
	color: ${props => props.theme.light.textColor};
	box-shadow: none;
	cursor: pointer;
	outline: none;
	&::placeholder {
		color: ${props => props.theme.light.textColor};
	}
	${({ theme }) => theme.media.landscapeMobile`
		width : 82%;
	`}
	${({ theme }) => theme.media.portraitTabletS`
		width : 88%;
	`}
`;

const ClearBtn = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 15%;
	height: 100%;
	border: 1px solid ${props => props.theme.light.lineColor};
	border-radius: 5px;
	cursor: pointer;
	${({ theme }) => theme.media.landscapeMobile`
		width : 18%;
	`}
	${({ theme }) => theme.media.portraitTabletS`
		width : 12%;
	`}
`;

const ClearI = styled(Clear)`
	width: 25px;
	color: ${props => props.theme.light.warnColor};
`;

const SubmitInput = styled.input`
	padding: 0 1rem;
	outline: none;
	border: none;
	background-color: ${props => props.theme.light.mainColor};
	color: ${props => props.theme.light.textColor};
	cursor: pointer;
	${({ theme }) => theme.media.landscapeMobile`
		padding : 0 0.5rem;
	`}
	${({ theme }) => theme.media.portraitTablet`
		padding : 0 0 0 0.5rem;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		padding : 0 0.2rem 0 0.8rem;
	`}
	${({ theme }) => theme.media.desktop`
		padding : 0 0.5rem 0 1.2rem;
	`}
`;

export default React.memo(AddTask);
