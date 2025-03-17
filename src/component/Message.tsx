const Message = ({ messages }) => {
  return (
    <div className="  h-96  ">
      <div className="">
        {messages.map((message, index) => {
          console.log(message);

          return (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              } animate-slideIn`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-5 ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                    : "bg-[#1C2333] text-gray-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Message;
