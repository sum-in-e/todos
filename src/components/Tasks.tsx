import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dbService } from '../fbase';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: object) => void;
	};
}

const Tasks: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [tasks, setTasks] = useState(null);

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setInputValue(value);
	};

	return (
		<>
			<Container>
				<div>
					<span></span>
					<span></span>
				</div>
				<div>
					<form>
						<input type="text" placeholder="New Task" value={inputValue} onChange={onInputChange} />
						<input type="submit" value="Save" />
					</form>
				</div>
			</Container>
		</>
	);
};

const Container = styled.div``;

export default Tasks;
