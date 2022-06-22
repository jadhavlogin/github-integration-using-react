
const getMembers = () => {
  return fetch("https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json");
};

const MemberService = {
    getMembers
}

export default MemberService;