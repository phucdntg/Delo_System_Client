import { createSlice } from "@reduxjs/toolkit";

const domainSlice = createSlice({
  name: "domain",
  initialState: {
    domainActive: ["qms", "lookup", "qna", "evaluation"],
  },
  reducers: {
    setDomainActive(state, action) {
      state.domainActive = action.payload;
    },
  },
});

export const { setDomainActive } = domainSlice.actions;
export default domainSlice.reducer;