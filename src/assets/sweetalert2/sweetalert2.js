// alert.js
import Swal from 'sweetalert2'

export class Alert {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
  }

  showAlert(
    title,
    text,
    icon,
    timeout = 5000,
    showConfirmButton = true,
    showCancelButton = false,
    showLoadingAnimetion = false,
    confirmButtonText = 'OK',
    cancelButtonText = 'Cancel',
  ) {
    let timerInterval
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      timer: timeout,
      timerProgressBar: true,
      showConfirmButton: showConfirmButton,
      showCancelButton: showCancelButton,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      didOpen: () => {
        if (showLoadingAnimetion) {
          Swal.showLoading()
        }
      },
    }).then(result => {
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
      }
    })
  }

}
