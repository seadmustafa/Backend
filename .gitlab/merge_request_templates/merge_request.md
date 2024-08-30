## Purpose

Pull-request purpose

## Related Links

[Task name]()

## Developer

- [ ] Set pull-request tilte by format: #{ticket_id} - {ticket_title}
- [ ] Set appropriate labels for pull-requests
- [ ] Impact Range: Of task/bug (Required when PR has label: Refactor)
  - [ ] TO relevant member for review
  - [ ] Note impact range into the ticket to QA re-test
- [ ] Pull-request is only Unit test?
- Self-check
  - [ ] Đã thực hiện self test kỹ chưa?
  - [ ] Check cẩn thận tất cả các logic thay đổi liên quan đến các lớp common, base. Đánh giá kỹ đối với những logic thay đổi của lớp base, common có ảnh hưởng đến các logic khác đang sử dụng nó hay không?
  - [ ] Check cẩn thận với các logic điều kiện rẽ nhánh. Cần đảm bảo các điều kiện rẽ nhánh sẽ hoạt động đúng theo spec, cần đánh giá kỹ đối với những điều kiện rẽ nhánh kết hợp(nhiều điều kiện)
  - [ ] Check cẩn thận với các logic vòng lặp. Cần đảm bảo các vòng lặp sẽ không rơi vào lặp vô hạn, và kết thúc vòng lặp k làm thay đổi giá trị dẫn đến việc ảnh hưởng sai đến các logic khác
  - [ ] Check toàn bộ các logic liên quan đến việc sử dụng đối tượng. Đảm bảo các ngoại lệ, điều kiện check đã xử lý cho các trường hợp object bị null, hoặc sai định dạng...
- [ ] Update ticket & Log spent time

## Evidence

(Screenshot or Video)

## Discussion

Note the part that you are not sure. Comment on your code is OK.

## Reviewers:

- @[Reviewer1]
- @[Reviewer2]

## Assignees:

- @[Your username]
