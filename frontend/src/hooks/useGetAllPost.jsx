import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/post/all",
          { withCredentials: true }
        );
        if (response.data.success) {
            console.log(response.data);
            dispatch(setPosts(response.data.posts));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPost();
  },[]);
};


export default useGetAllPost