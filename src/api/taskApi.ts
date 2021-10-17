import { dbService } from '../fbase';
import { collection, addDoc, getDoc, setDoc, doc } from 'firebase/firestore';
import { IDateContainer, ITodo, ITodoAll } from '../types/taskListTypes';

// 1. Api요청 한 곳에서 하도록 정리

export interface IDeleteTask {
	uid: string;
	date: string;
	todoAll: IDateContainer[];
}

export const deleteTaskApi = async ({ uid, date, todoAll }: IDeleteTask): Promise<void> => {
	await setDoc(doc(dbService, uid, date), todoAll);
};
