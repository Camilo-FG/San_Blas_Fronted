import { useGetUserList } from "../hooks/hooksUsuarios/useGetUserList"

export const UserList = () => {
    const { users, loading, error } = useGetUserList();

    if(loading) return <div>Loading...</div>;
    if(error != null) return <div>{error}</div>;

    return(
        <>
            <ul>
                {users.map((user) => (
                    <li key={user.ID}>
                        {user.UserName} - {user.Email}
                    </li>
                ))}
            </ul>
        </>
    )
}