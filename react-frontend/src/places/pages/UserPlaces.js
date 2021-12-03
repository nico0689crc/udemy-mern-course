import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import { useParams } from "react-router-dom";
import useHttpClient from "../../shared/hooks/http-hooks";

import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import PlaceList from "../components/PlaceList";

const UserPlaces = () => {
  const auth = useContext(AuthContext);
  const userId = useParams().userId;
  const [places, setPlaces] = useState([]);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchPlaces = async () => {
      const url = `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`;

      await sendRequest(url, "GET", null, {
        Authorization: "Barrer " + auth.token,
      }).then(responseData => {
        setPlaces(responseData.places);
      });
    };
    if (auth.token) {
      fetchPlaces();
    }
  }, [userId]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      {!isLoading && places.length > 0 && <PlaceList items={places} />}
    </>
  );

  return;
};

export default UserPlaces;
