import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { defualtFirebase, dbService } from '../fbase';
import theme from '../styles/theme';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';
import EditTaskForm from './EditTaskForm';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	getTasks: () => void;
}

const Task: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue, userInfo, getTasks }) => {
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [toggleEdit, setToggleEdit] = useState<boolean>(false);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const temporaryStorage: any = {};

	const relocation = async (): Promise<void> => {
		const doc = dbService.doc(`${userInfo.uid}/${date}`);
		const data = (await doc.get()).data();
		if (data !== undefined) {
			const values = Object.values(data);
			values.forEach((value: string, index: number): void => {
				temporaryStorage[index] = value;
			});
			await doc.set(temporaryStorage);
			console.log('relocation 끝');
		}
	};

	const onDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const doc = dbService.doc(`${userInfo.uid}/${date}`);
			const data = (await doc.get()).data();
			try {
				for (const key in data) {
					if (key === taskKey) {
						await doc.update({
							[key]: defualtFirebase.firestore.FieldValue.delete(),
						});
						await relocation();
					}
				}
			} catch (err) {
				alert(err.message);
			} finally {
				getTasks();
			}
		}
	};

	const onToggleClick = (): void => {
		setToggleEdit(prev => !prev);
		setEditedDate(date);
		console.log('onToggleClick 실행');
	};

	const onCheckboxClick = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		if (userInfo.uid !== null) {
			if (e.target.labels !== null) {
				const {
					target: {
						labels: {
							0: { innerText: text },
						},
					},
				} = e;
				if (e.target.checked) {
					const userCollection = await dbService.collection(userInfo.uid).get();
					const docList = userCollection.docs.map(doc => doc.id);
					if (docList.includes('완료')) {
						const completeDoc = await dbService.doc(`${userInfo.uid}/완료`).get();
						const data = completeDoc.data();
						if (data !== undefined) {
							const dataLength = Object.keys(data).length;
							const taskObj = {
								...data,
								[dataLength]: text,
							};
							try {
								await completeDoc.ref.update(taskObj);
								const doc = dbService.doc(`${userInfo.uid}/${date}`);
								const data = (await doc.get()).data();
								for (const key in data) {
									if (key === taskKey) {
										await doc.update({
											[key]: defualtFirebase.firestore.FieldValue.delete(),
										});
										await relocation();
									}
								}
							} catch (err) {
								alert(err.message);
							} finally {
								e.target.checked = false;
								getTasks();
							}
						}
					} else {
						try {
							await dbService.collection(userInfo.uid).doc('완료').set({
								0: text,
							});
							const doc = dbService.doc(`${userInfo.uid}/${date}`);
							const data = (await doc.get()).data();
							for (const key in data) {
								if (key === taskKey) {
									await doc.update({
										[key]: defualtFirebase.firestore.FieldValue.delete(),
									});
									await relocation();
								}
							}
						} catch (err) {
							alert(err.message);
						} finally {
							e.target.checked = false;
							getTasks();
						}
					}
				}
			}
		}
	};

	return (
		<>
			{toggleEdit ? (
				<EditTaskForm
					date={date}
					taskKey={taskKey}
					taskValue={taskValue}
					userInfo={userInfo}
					getTasks={getTasks}
					toggleEdit={toggleEdit}
					editedDate={editedDate}
					setEditedDate={setEditedDate}
					onToggleClick={onToggleClick}
				/>
			) : (
				''
			)}
			<Container>
				<div>
					<Label>
						<CheckInput type="checkbox" onChange={onCheckboxClick} />
						<CheckSpan />
						{taskValue}
					</Label>
				</div>
				<div>
					<EditI onClick={onToggleClick} />
					<DeleteI onClick={onDeleteClick} />
				</div>
			</Container>
		</>
	);
};

/* 
<SaveI onClick={onSaveClick} />
<CancelI onClick={onToggleClick} />
*/

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.5rem;
`;

/* ********************* 편집 비활성화 ********************* */
const Label = styled.label`
	position: relative;
	margin-right: 0.5rem;
	color: ${props => props.theme.light.whiteColor};
`;

const CheckInput = styled.input`
	margin-right: 0.8rem;
	opacity: 0;
`;

const CheckSpan = styled.span`
	position: absolute;
	top: 0px;
	left: 0px;
	height: 24px;
	width: 24px;
	background-color: transparent;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.light.whiteColor};

	&::after {
		position: absolute;
		content: '';
		left: 12px;
		top: 12px;
		height: 0px;
		width: 0px;
		border-radius: 5px;
		border: solid ${props => props.theme.light.greenColor};
		border-width: 0 3px 3px 0;
		-webkit-transform: rotate(0deg) scale(0);
		-ms-transform: rotate(0deg) scale(0);
		transform: rotate(0deg) scale(0);
		opacity: 1;
	}

	${Label} input:checked ~ & {
		background-color: ${props => props.theme.light.whiteColor};
		border-radius: 5px;
		-webkit-transform: rotate(0deg) scale(1);
		-ms-transform: rotate(0deg) scale(1);
		transform: rotate(0deg) scale(1);
		opacity: 1;
		border: 2px solid ${props => props.theme.light.whiteColor};
	}

	${Label} input:checked ~ &::after {
		-webkit-transform: rotate(45deg) scale(1);
		-ms-transform: rotate(45deg) scale(1);
		transform: rotate(45deg) scale(1);
		opacity: 1;
		left: 6px;
		top: 1px;
		width: 6px;
		height: 12px;
		border: solid ${props => props.theme.light.greenColor};
		border-width: 0 2px 2px 0;
		background-color: transparent;
		border-radius: 0;
	}
`;

const EditI = styled(EditAlt)`
	width: 1rem;
	margin-right: 0.2rem;
	color: ${props => props.theme.light.grayColor};
`;

const DeleteI = styled(DeleteBin)`
	width: 1rem;
	color: ${props => props.theme.light.grayColor};
`;

export default Task;
