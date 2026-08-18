import axios from "axios";
import { getBaseUrl, getHeaders } from "../helpers";

const baseUrl = getBaseUrl();

const DEFAULT_WORKFLOW = {
  nodes: [
    { id: "1", position: { x: 50, y: 150 }, data: { label: "TODO" } },
    { id: "2", position: { x: 300, y: 150 }, data: { label: "IN_PROGRESS" } },
    { id: "3", position: { x: 550, y: 150 }, data: { label: "DONE" } },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
  ],
};

export const workflowRoutes = {
  createWorkflow: async () => {
    try {
      const { data } = await axios.post(`${baseUrl}/api/workflow`, {
        headers: getHeaders(),
      });
      return data?.workflow || DEFAULT_WORKFLOW;
    } catch (error) {
      console.error(error);
      return DEFAULT_WORKFLOW;
    }
  },

  getWorkflow: async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/api/workflow`, {
        headers: getHeaders(),
      });
      return data?.workflow || DEFAULT_WORKFLOW;
    } catch (error) {
      console.error("Error fetching workflow:", error);
      return DEFAULT_WORKFLOW;
    }
  },

  updateWorkflow: async (updatedWorkflow: any) => {
    try {
      const { data } = await axios.patch(
        `${baseUrl}/api/workflow`,
        updatedWorkflow,
        {
          headers: getHeaders(),
        }
      );
      return data?.workflow || updatedWorkflow;
    } catch (error) {
      console.error("Error updating workflow:", error);
      throw error;
    }
  },
};