import React, { useState, useEffect } from "react";

import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import UsersList from "../components/UsersList";
import useHttpClient from "../../shared/hooks/http-hooks";

const Users = () => {
  const [users, setUsers] = useState([]);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchUsers = async () => {
      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users`).then(
        responseData => {
          setUsers(responseData.users);
        }
      );
    };

    fetchUsers();
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      {!isLoading && users.length > 0 && <UsersList items={users} />}
    </>
  );
};

export default Users;
