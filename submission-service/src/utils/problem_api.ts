import axios from "axios";

export default axios.create({
    baseURL: process.env.PROBLEM_SERVICE_URL
})