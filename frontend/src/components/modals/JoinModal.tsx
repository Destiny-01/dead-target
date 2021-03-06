import { Dialog, Transition } from '@headlessui/react'
import { XCircleIcon } from '@heroicons/react/outline'
import { Fragment, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { startGame } from '../../utils/contract'
import { Alert } from '../alerts/Alert'
import { StartModal } from './StartModal'

type Props = {
  isOpen: boolean
  socket: any
  handleClose: () => void
}

export const JoinModal = ({ isOpen, socket, handleClose }: Props) => {
  const history = useHistory()
  const [code, setCode] = useState('')
  const [guess, setGuess] = useState('')
  const [isInvalidGame, setIsInvalidGame] = useState(false)
  const [isStartModalOpen, setStartModalOpen] = useState(false)
  const [isStartAlertOpen, setStartAlertOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)

  useEffect(() => {
    socket.on('hash2', async (hashSol: string, salt: string) => {
      if (hashSol && isStartModalOpen) {
        const start = await startGame(hashSol)
        setStartModalOpen(false)
        if (start === true) {
          setStartModalOpen(false)
          socket.emit('joinGame', code, guess, hashSol, salt)
          history.push(`/?room_id=${code}`)
        } else {
          setStartModalOpen(false)
          setStartAlertOpen(true)
        }
      }
    })
    socket.on('unknownGame', () => {
      setIsInvalidGame(true)
      setStartModalOpen(false)
    })
  }, [socket, isStartModalOpen, isInvalidGame])

  const handleSubmit = async () => {
    const guessArr = String(guess)
      .split('')
      .map((currentGuess) => {
        return Number(currentGuess)
      })
    if (
      guess.length !== 4 ||
      !guessArr.every((e, i, a) => a.indexOf(e) === i)
    ) {
      setIsWordNotFoundAlertOpen(true)
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
      }, 3000)
    }
    !isStartModalOpen && socket.emit('hash2', guessArr, code)
    setStartModalOpen(true)
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <Alert
                message="Please input a non repeating 4 digit number"
                isOpen={isWordNotFoundAlertOpen}
              />
              <Alert
                message="Game not found or already 2 players in game"
                isOpen={isInvalidGame}
              />
              <Alert
                isOpen={isStartAlertOpen}
                message="Error while sending transaction. Please confirm you have enough ONE in your wallet"
              />
              <StartModal isOpen={isStartModalOpen} />
              <div className="absolute right-4 top-4">
                <XCircleIcon
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => handleClose()}
                />
              </div>
              <div>
                <div className="text-center">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Join an existing game
                  </Dialog.Title>
                  <div className="mt-3">
                    <label className="block mt-3">
                      <span className="block text-sm font-medium text-slate-700">
                        Enter game ID
                      </span>
                      <input
                        className=" placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 px-3 mb-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                        placeholder="Ask oppponent to send code (not case sensitive)"
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        type="text"
                      />
                    </label>
                    <label className="block mt-3">
                      <span className="block text-sm font-medium text-slate-700">
                        Create your unique non-repeating 4-digit code. You might
                        need to sign a transaction before proceeding
                      </span>
                      <input
                        className=" placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 px-3 mb-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                        placeholder="eg. 1234"
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyPress={(e) => e.code === 'Enter' && handleSubmit()}
                        type="number"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full items-center py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
