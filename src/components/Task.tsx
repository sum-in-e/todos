import React, { useState } from 'react';
import styled from 'styled-components';

interface IProps {
	task: string;
}

const Task: React.FunctionComponent<IProps> = ({ task }) => {
	const [inputValue, setInputValue] = useState<string>(task);
	const [toggleEdit, setToggleEdit] = useState<boolean>(false);

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
	};

	const onToggleClick = (): void => {
		setToggleEdit(prev => !prev);
	};

	return (
		<>
			{toggleEdit ? (
				<>
					<input type="text" value={inputValue} onChange={onInputChange} placeholder="Edit Task" required />
					<button>저장</button>
					<button onClick={onToggleClick}>취소</button>
				</>
			) : (
				<Container>
					<div>{task}</div>
					<button onClick={onToggleClick}>수정</button>
				</Container>
			)}
		</>
	);
};

const Container = styled.div``;

export default Task;
