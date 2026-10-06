import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({

  name: "requests",

  initialState: {
    requests: []
  },

  reducers: {

    setRequests: (state, action) => {
      state.requests = action.payload;
    },

    addRequest: (state, action) => {
      state.requests.push(action.payload);
    },

    updateStatus: (state, action) => {

      const request = state.requests.find(
        r => r.id === action.payload.id
      );

      if (request) {
        request.status = action.payload.status;
      }

    },

    deleteRequest: (state, action) => {

      state.requests =
        state.requests.filter(
          r => r.id !== action.payload
        );

    }

  }

});

export const {
  setRequests,
  addRequest,
  updateStatus,
  deleteRequest
} = requestSlice.actions;

export default requestSlice.reducer;