/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const review = async (review, rating, tourID) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tourID}/reviews`,
      data: {
        review,
        rating
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

