// import { FirebaseError } from 'firebase';
// import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
// import { deleteTaskApi, IDeleteTask } from '../api/taskApi';
// import { IDateContainer, ITodoAll } from '../types/taskListTypes';
// import { dbService } from '../fbase';

// const useDeleteTodoMutation = (): UseMutationResult => {
// 	const queryClient = useQueryClient();

// 	return useMutation(deleteTaskApi, {
// 		onMutate: async (uid: string, date: string, todoAll: ITodoAll) => {
// 			// 여기서 todoAll을 받아서 해당 date의 doc을 찾은 후, 내부 아이템을 수정하게 해야겠다.

// 			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
// 			await queryClient.cancelQueries('todoAll');

// 			// Snapshot the previous value => 이전 데이터 스냅샷으로 기록. 즉, 스냅샷으로 기록할 기존 데이터를 넘겨 받도록 해줘야 한다.
// 			const previousTodoAll = queryClient.getQueryData('todoAll'); // 기존 todoAll

// 			// Optimistically update to the new value => 낙관적으로 업데이트 될 새로운 값을 생성. 여기서 기존 todos에서 삭제할 todo를 제거한 나머지로 새 todos를 만든 다음 반환하자.
// 			if (previousTodoAll) {
// 				// 여기서 date doc 찾아야해
// 			}
// 			queryClient.setQueryData('todoAll', todoAll);

// 			// Return a context object with the snapshotted value
// 			// Optionally return a context containing data to use when for example rolling back
// 			// 롤백에 사용하기 위해 앞서 스냅샷으로 저장한 데이터를 return
// 			return { previousTodoAll };
// 		},
// 		// If the mutation fails, use the context returned from onMutate to roll back
// 		onError: (err: FirebaseError, context: { previousTodoAll: ITodoAll | undefined }) => {
// 			if (context?.previousTodoAll) {
// 				queryClient.setQueryData<ITodoAll>('todoAll', context.previousTodoAll);
// 			}
// 		},
// 		// Always refetch after error or success:
// 		onSettled: () => {
// 			queryClient.invalidateQueries('todoAll');
// 		},
// 	});

// 	// return useMutation(({ uid, date, todoAll }: IDeleteTask) => dbService.doc(`${uid}/${date}`).set(todoAll), options);
// };

// export default useDeleteTodoMutation;
