import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const response = await axios.get(
          "https://bit-mitra.onrender.com/api/v1/post/all",
          { withCredentials: true }
        );
        if (response.data.success) {
          console.log("Fetching: " + response.data);
          dispatch(setPosts(response.data.posts));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPost();
  }, []);
};

export default useGetAllPost;
