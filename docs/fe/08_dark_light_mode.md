- Dark Light Mode: chế độ sáng tối của trang web
+ Trên thanh header của components Header.tsx thêm 1 icon mặt mặt trăng bằng react icon đại diện cho màu tối của trang web hiện tại trang web đang là màu sáng khi click vào mặt trăng thì trang web chuyển sang màu tối và các chữ text của trang web cũng sẽ chuyển sang màu ngược lại sáng trên nền tối để đọc được và icon hiện tại sau khi chuyển sang nền tối thì icon sẽ là mặt trời, khi click vào icon mặt trời thì trang web sáng trở lại và icon chuyển sang mặt trăng, icon này thêm vào nằm trước bên trái icon giỏ hàng hiện tại
+ Lưu ý: khi chuyển chế độ sáng tối thì cả trang web cũng sẽ đổi theo từ trang chủ đến trang chi tiết sản phẩm , trang giỏ hàng... tất cả đều bị thay đổi hết 
+ Chuyển sang chế độ tối sáng thì thêm 1 animation chuyển nhẹ nhàng để nhìn thoải mái hơn
+ Lưu trạng thái màu nền của trang web và localstorage khi load lại trang hay thoát khỏi trình duyệt vào lại cũng vẫn giữ nguyên màu nền đã chọn trước đó
