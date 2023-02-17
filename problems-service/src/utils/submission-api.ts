import axios from "axios";
export default axios.create({ baseURL: process.env.SUBMISSION_SERVICE_URL })